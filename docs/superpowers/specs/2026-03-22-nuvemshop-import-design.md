# NuvemShop Product Import — Design Spec

## Overview

Add an integration module to Seamstress that allows admin and requester users to import products from NuvemShop via CSV upload. The module is designed for future expansion to support direct NuvemShop API integration. NuvemShop is the source of truth for what's currently producible — the import is a repeatable sync that keeps Seamstress items in 1:1 parity with the NuvemShop store.

## Requirements

1. **CSV upload** — User uploads a NuvemShop product export CSV file
2. **Configurable column mapping** — UI lets the **admin** configure which CSV columns map to Seamstress fields (Name, Price, ExternalId, Category/Fabric, Variants/Colors, Size, Image URL). This mapping is saved and reused by requesters on subsequent imports.
3. **Repeatable sync** — On each import, items are matched by `ExternalId` + `SalePlatformId`. New items are created, existing items are updated, items no longer in the CSV are inactivated
4. **Preview before execution** — After mapping, a preview shows what will be created, updated, and inactivated. Import only executes on user confirmation
5. **Image download** — Product images are downloaded from NuvemShop CDN and re-uploaded to Azure Blob Storage at import time, decoupling Seamstress from NuvemShop's CDN
6. **Entity resolution** — Colors, Fabrics, and Sizes referenced in the CSV are matched by name (case-insensitive) against existing DB records, including inactive ones. Inactive matches are reactivated. Unmatched values are created automatically (with `IsActive = true`)
7. **Role-based access** — The import flow (upload, preview, execute) is accessible to **Admin and Requester** roles. Column mapping configuration is restricted to **Admin only**.
8. **Future extensibility** — The architecture supports adding NuvemShop API as an alternative data source with minimal changes (swap CSV parser for API client; pipeline from entity resolution onward is shared)

## Data Mapping

NuvemShop products map to Seamstress Items as follows:

| NuvemShop Field | Seamstress Field | Notes |
|-----------------|------------------|-------|
| Product Name | `Item.Name` | Direct mapping |
| Price | `Item.Price` | Direct mapping |
| Product ID | `Item.ExternalId` | **New field** — used for sync matching |
| Category (Linho, Crepe, etc.) | `Item.ItemFabrics` → `Fabric` | NuvemShop uses fabric as primary category |
| Variant names (Pink, Marrom, etc.) | `Item.ItemColors` → `Color` | Extracted from variant data |
| Size (Único, P, M, G, etc.) | `Item.ItemSizes` → `Size` | Extracted from variant data |
| Image URLs | `Item.ImageURL` | Downloaded from CDN → uploaded to Azure Blob |
| — | `Item.SalePlatformId` | **New field** — FK to SalePlatforms, set to NuvemShop platform ID |
| Garment-type categories | (ignored) | Vestidos, Conjuntos, etc. are not tracked in Seamstress |

### NuvemShop store category → Fabric mapping (elizandrade.com)

| NuvemShop Category | Seamstress Fabric |
|--------------------|-------------------|
| Linho | Linho |
| Crepe | Crepe (user may need to disambiguate from subtypes) |
| Veludos | Veludo |
| Malha Tricot | Malha tricô |
| Algodão | Malha de algodão |

> **Note:** This table is provided as reference for the specific NuvemShop store. The actual mapping is handled by the generic entity resolution logic (match by name, create if unmatched).

### Multiple images

NuvemShop products can have multiple images. All product images listed in the CSV are downloaded and stored. `Item.ImageURL` uses the existing semicolon-delimited format (e.g., `uuid1.jpg;uuid2.jpg`). On update, existing blob names are compared against new image URLs to avoid re-downloading unchanged images. Orphaned blobs (images no longer in the CSV) are deleted.

## Domain Changes

### Item entity — new fields

```csharp
// Seamstress.Domain/Item.cs
public string? ExternalId { get; set; }    // NuvemShop Product ID
public int? SalePlatformId { get; set; }   // FK → SalePlatforms
public SalePlatform? SalePlatform { get; set; }
```

- `ExternalId` is nullable (existing manually-created items won't have one)
- `SalePlatformId` is nullable (same reason)
- Unique constraint on `(ExternalId, SalePlatformId)` to prevent duplicate imports

### SalePlatforms table

Add a "Nuvem Shop" entry to the existing `SalePlatforms` table (or use existing "Ecommerce" entry — TBD during implementation).

### ImportMapping entity (new)

```csharp
// Seamstress.Domain/ImportMapping.cs
public int Id { get; set; }
public int SalePlatformId { get; set; }           // FK → SalePlatforms
public SalePlatform SalePlatform { get; set; }
public string MappingsJson { get; set; }           // Serialized [{ csvColumn, seamstressField }]
```

Stores the saved column mapping configuration per platform. `MappingsJson` is a JSON string — avoids a separate join table for a simple key-value list. One mapping per `SalePlatformId` (unique constraint).

### Database migration

An EF Core migration adds:
- Two new columns to `Items` (`ExternalId`, `SalePlatformId`) and the unique index on `(ExternalId, SalePlatformId)`
- New `ImportMappings` table

## Backend Architecture

### Import Pipeline

The pipeline is the core abstraction. It processes normalized product rows regardless of source (CSV or future API).

```
Source (CSV / API)
  ↓
① Parse → raw rows with column headers
  ↓
② Column Mapping → apply user-defined mapping → normalized product rows
  ↓
③ Resolve Entities → find or create Colors, Fabrics, Sizes by name (case-insensitive, including inactive records — reactivate if found inactive)
  ↓
④ Diff Against DB → query existing Items by ExternalId + SalePlatformId
   → classify each row as: Create | Update | Inactivate
  ↓
⑤ Generate Preview → return preview DTO to frontend
  ↓
⑥ [User confirms]
  ↓
⑦ Execute Import → create/update/inactivate items in DB (wrapped in a single DB transaction)
  ↓
⑧ Download Images → fetch from CDN URLs (after transaction commits; failures logged, not rolled back)
  ↓
⑨ Upload to Azure Blob → store images, update ImageURL field (uses new Stream-based overload)
  ↓
Return ImportResultDto (counts + any errors)
```

When adding API integration later, only step ① changes — a `NuvemShopApiClient` replaces the CSV parser. Steps ②–⑨ remain unchanged.

### New Files

**Seamstress.Application:**
- `Contracts/IImportService.cs` — interface for the import pipeline
- `ImportService.cs` — implementation (works directly with `Item` domain entities and `IGeneralPersistence` for bulk operations, bypassing `ItemService`/`ItemInputDto` which are designed for single-item CRUD)
- `Contracts/IAzureBlobService.cs` — add new overload: `Task<string> UploadModelImageAsync(Stream imageStream, string imageName)` (existing method accepts `IFormFile`; CDN downloads produce `Stream`)
- `AzureBlobService.cs` — implement the new overload
- `Dtos/ImportColumnMappingDto.cs` — column-to-field mapping pairs
- `Dtos/ImportPreviewDto.cs` — preview summary (toCreate, toUpdate, toInactivate lists)
- `Dtos/ImportPreviewItemDto.cs` — individual item in preview (name, price, colors, fabric, sizes, action)
- `Dtos/ImportResultDto.cs` — execution result (created, updated, inactivated counts, errors)
- `Dtos/ImportUploadResultDto.cs` — parsed CSV info (detected columns, sample rows)

**Seamstress.Persistence:**
- `IItemPersistence.cs` — add `GetItemsByExternalSourceAsync(int salePlatformId)` method
- `ItemPersistence.cs` — implement the new query (includes `ItemColors.Color`, `ItemFabrics.Fabric`, `ItemSizes.Size` for diff comparison; excludes `ItemSizes.Measurements` to avoid cascade issues)

**Seamstress.API:**
- `Controllers/ImportController.cs` — 3 endpoints (upload, preview, execute)

### API Endpoints

All endpoints require `[Authorize]`. Role requirements vary per endpoint.

#### `POST /api/import/upload` — Admin, Requester
- **Input**: Multipart form with CSV file
- **Process**: Parse CSV headers and first N sample rows
- **Output**: `ImportUploadResultDto` — list of column names, sample data rows, a server-generated `sessionId` to track this import session, and the current saved column mapping (if one exists)
- **State**: Parsed CSV data cached server-side (in-memory or temp file) keyed by `sessionId`

#### `POST /api/import/preview` — Admin, Requester
- **Input**: `{ sessionId, mappings: [{ csvColumn, seamstressField }], salePlatformId }`
- **Process**: Apply column mapping → resolve entities → diff against DB → generate preview
- **Output**: `ImportPreviewDto` — lists of items to create, update, inactivate with details

#### `POST /api/import/execute` — Admin, Requester
- **Input**: `{ sessionId }`
- **Process**: Execute the previewed import → download images → upload to Azure Blob
- **Output**: `ImportResultDto` — counts of created, updated, inactivated items + any errors

#### `PUT /api/import/mapping` — Admin only
- **Input**: `{ salePlatformId, mappings: [{ csvColumn, seamstressField }] }`
- **Process**: Save/update the column mapping configuration for a given platform
- **Output**: Saved mapping

#### `GET /api/import/mapping/{salePlatformId}` — Admin, Requester
- **Output**: The saved column mapping for the given platform (if exists)

### Import Session Management

The import is a multi-step process (upload → map → preview → execute). Server-side state between steps is managed via a session ID:

- On upload, a GUID `sessionId` is generated and the parsed CSV data is cached
- Preview and execute reference this `sessionId`
- Sessions expire after 30 minutes of inactivity
- Implementation: in-memory dictionary with expiration (simple for single-server deployment)

## Frontend Architecture

### New Components

All under `src/app/routes/import/`:

#### ImportComponent (main page)
- Route at `/dashboard/import`, accessible to Admin and Requester roles
- Multi-step wizard flow:
  1. **Upload step** — drag-and-drop CSV upload (reuse ngx-dropzone pattern)
  2. **Mapping step** — if a saved mapping exists, auto-apply it and skip to preview. If no saved mapping exists and user is a Requester, show a message that an admin needs to configure the mapping first. If user is Admin, show the mapping dropdowns.
  3. **Preview step** — table showing items to be created/updated/inactivated with details
  4. **Result step** — summary of what was imported

#### MappingConfigComponent (admin-only)
- Route at `/dashboard/import/mapping`, accessible to Admin only
- Standalone page (or section within ImportComponent) to configure and save column mappings per platform
- Allows admin to upload a sample CSV, set the mapping, and save it for reuse

#### Navigation
- No new sidebar link. Import is accessed via an "Importar" button on the Items list page (`ItemsComponent`), next to the existing "Novo Modelo" button. Visible for Admin and Requester roles.

#### Module Registration
- Register `ImportComponent` and `MappingConfigComponent` in `app.module.ts` declarations (NgModule pattern)
- Add routes in `app-routing.module.ts`: `/dashboard/import` with admin+requester guard, `/dashboard/import/mapping` with admin-only guard

### New Service

`src/app/services/import.service.ts`:
- `uploadCsv(file: File)` → POST `/api/import/upload`
- `preview(sessionId, mappings, salePlatformId)` → POST `/api/import/preview`
- `executeImport(sessionId)` → POST `/api/import/execute`

### New Models

`src/app/models/import/`:
- `ImportUploadResult` — columns, sampleRows, sessionId
- `ImportColumnMapping` — csvColumn, seamstressField
- `ImportPreview` — toCreate[], toUpdate[], toInactivate[]
- `ImportPreviewItem` — name, price, colors, fabric, sizes, action, externalId
- `ImportResult` — created, updated, inactivated counts, errors

### UI Flow

```
[Upload CSV] → [Map Columns] → [Preview Changes] → [Confirm] → [Results]
     ↑                                   |
     └──────── Back / Re-upload ─────────┘
```

1. **Upload**: User drags CSV file → calls `/api/import/upload` → receives column list
2. **Map**: Dropdowns for each Seamstress field (Name, Price, ExternalId, Category/Fabric, Colors, Sizes, Image URL) → user selects corresponding CSV column for each
3. **Preview**: Calls `/api/import/preview` → shows 3-section table:
   - Items to **create** (new in NuvemShop, not in Seamstress)
   - Items to **update** (exist in both, data changed)
   - Items to **inactivate** (in Seamstress but not in CSV)
4. **Confirm**: User clicks "Execute Import" → calls `/api/import/execute` → shows spinner during image downloads
5. **Results**: Shows counts (X created, Y updated, Z inactivated) and any errors

## Import Behavior Details

### ImportService vs ItemService

`ImportService` operates directly on `Item` domain entities via `IGeneralPersistence`, bypassing `ItemService` and its DTOs. This is intentional:
- Bulk import has different concerns than single-item CRUD (no individual image upload, no DTO validation)
- `ItemInputDto` and `ItemOutputDto` remain unchanged — they serve the manual item creation/editing flow
- The new `ExternalId` and `SalePlatformId` fields are added to the `Item` domain entity only. They appear in `ItemOutputDto` for display purposes but are not part of `ItemInputDto` (they are set exclusively by the import process)

### ItemSize and Measurements handling

Imported items are created with `ItemSize` records but **no `ItemSizeMeasurement` data** (NuvemShop does not provide body measurements). When updating an existing item's sizes during re-import:
- Only **add** new `ItemSize` records for sizes not already present
- Only **remove** `ItemSize` records for sizes no longer in the CSV
- **Never recreate** existing `ItemSize` records that match by `SizeId` — this preserves any manually-entered `ItemSizeMeasurement` data (which cascade-deletes when `ItemSize` is removed)

### Transaction scope

The execute step (step ⑦) wraps all create/update/inactivate operations in a single database transaction. Image downloads (steps ⑧–⑨) happen **after** the transaction commits, so a failed image download does not roll back the item changes. Failed image downloads are logged and reported in `ImportResultDto.Errors`.

## Error Handling

- **Invalid CSV**: Return clear error message (wrong encoding, empty file, no rows)
- **Missing required mappings**: Frontend validates that Name, Price, ExternalId are mapped before allowing preview
- **Image download failure**: Log the error, create the item without image, include in result errors list. Do not fail the entire import for one bad image.
- **Duplicate ExternalId in CSV**: Warn in preview, use last occurrence
- **Entity resolution ambiguity**: When a fabric name partially matches multiple DB records (e.g., "Crepe" matches "Crepe acetinado", "Crepe dune"), create a new Fabric with the exact CSV value. The user can merge/clean up later.

## Testing Strategy

### Backend
- Unit tests for CSV parsing with various formats (different delimiters, encodings, quoted fields)
- Unit tests for entity resolution logic (exact match, case-insensitive match, new creation)
- Unit tests for diff logic (create, update, inactivate classification)
- Integration test for full pipeline with test CSV → preview → execute

### Frontend
- Component tests for each wizard step
- Service tests with mocked HTTP responses

## Security

- Import flow endpoints (upload, preview, execute, get mapping) check Admin or Requester role
- Mapping configuration endpoint (PUT mapping) checks Admin role only
- File upload size limit (configurable, default 10MB)
- CSV parsing with row limit to prevent memory exhaustion
- Session cleanup on expiration
- No user-provided data used in file system paths or SQL (EF Core parameterized queries)

## Out of Scope

- NuvemShop API integration (future phase)
- Scheduled/automatic sync (future — user triggers import manually)
- Bidirectional sync (Seamstress → NuvemShop)
- Bulk image management UI
- Product variant pricing (all variants share the product price)
