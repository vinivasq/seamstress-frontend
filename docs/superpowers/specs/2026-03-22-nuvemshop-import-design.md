# NuvemShop Product Import — Design Spec

## Overview

Add an integration module to Seamstress that allows admin users to import products from NuvemShop via CSV upload. The module is designed for future expansion to support direct NuvemShop API integration. NuvemShop is the source of truth for what's currently producible — the import is a repeatable sync that keeps Seamstress items in 1:1 parity with the NuvemShop store.

## Requirements

1. **CSV upload** — Admin uploads a NuvemShop product export CSV file
2. **Configurable column mapping** — UI lets the admin map CSV columns to Seamstress fields (Name, Price, ExternalId, Category/Fabric, Variants/Colors, Size, Image URL)
3. **Repeatable sync** — On each import, items are matched by `ExternalId` + `SalePlatformId`. New items are created, existing items are updated, items no longer in the CSV are inactivated
4. **Preview before execution** — After mapping, a preview shows what will be created, updated, and inactivated. Import only executes on user confirmation
5. **Image download** — Product images are downloaded from NuvemShop CDN and re-uploaded to Azure Blob Storage at import time, decoupling Seamstress from NuvemShop's CDN
6. **Entity resolution** — Colors, Fabrics, and Sizes referenced in the CSV are matched by name against existing DB records. Unmatched values are created automatically
7. **Admin-only access** — All import functionality is restricted to users with the Admin role
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

### Database migration

An EF Core migration adds the two new columns to `Items` and the unique index on `(ExternalId, SalePlatformId)`.

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
③ Resolve Entities → find or create Colors, Fabrics, Sizes by name
  ↓
④ Diff Against DB → query existing Items by ExternalId + SalePlatformId
   → classify each row as: Create | Update | Inactivate
  ↓
⑤ Generate Preview → return preview DTO to frontend
  ↓
⑥ [User confirms]
  ↓
⑦ Execute Import → create/update/inactivate items in DB
  ↓
⑧ Download Images → fetch from CDN URLs
  ↓
⑨ Upload to Azure Blob → store images, update ImageURL field
  ↓
Return ImportResultDto (counts + any errors)
```

When adding API integration later, only step ① changes — a `NuvemShopApiClient` replaces the CSV parser. Steps ②–⑨ remain unchanged.

### New Files

**Seamstress.Application:**
- `Contracts/IImportService.cs` — interface for the import pipeline
- `ImportService.cs` — implementation
- `Dtos/ImportColumnMappingDto.cs` — column-to-field mapping pairs
- `Dtos/ImportPreviewDto.cs` — preview summary (toCreate, toUpdate, toInactivate lists)
- `Dtos/ImportPreviewItemDto.cs` — individual item in preview (name, price, colors, fabric, sizes, action)
- `Dtos/ImportResultDto.cs` — execution result (created, updated, inactivated counts, errors)
- `Dtos/ImportUploadResultDto.cs` — parsed CSV info (detected columns, sample rows)

**Seamstress.Persistence:**
- `IItemPersistence.cs` — add `GetItemsByExternalSourceAsync(int salePlatformId)` method
- `ItemPersistence.cs` — implement the new query

**Seamstress.API:**
- `Controllers/ImportController.cs` — 3 endpoints (upload, preview, execute)

### API Endpoints

All endpoints require `[Authorize]` and Admin role check.

#### `POST /api/import/upload`
- **Input**: Multipart form with CSV file
- **Process**: Parse CSV headers and first N sample rows
- **Output**: `ImportUploadResultDto` — list of column names, sample data rows, a server-generated `sessionId` to track this import session
- **State**: Parsed CSV data cached server-side (in-memory or temp file) keyed by `sessionId`

#### `POST /api/import/preview`
- **Input**: `{ sessionId, mappings: [{ csvColumn, seamstressField }], salePlatformId }`
- **Process**: Apply column mapping → resolve entities → diff against DB → generate preview
- **Output**: `ImportPreviewDto` — lists of items to create, update, inactivate with details

#### `POST /api/import/execute`
- **Input**: `{ sessionId }`
- **Process**: Execute the previewed import → download images → upload to Azure Blob
- **Output**: `ImportResultDto` — counts of created, updated, inactivated items + any errors

### Import Session Management

The import is a multi-step process (upload → map → preview → execute). Server-side state between steps is managed via a session ID:

- On upload, a GUID `sessionId` is generated and the parsed CSV data is cached
- Preview and execute reference this `sessionId`
- Sessions expire after 30 minutes of inactivity
- Implementation: in-memory dictionary with expiration (simple for single-server deployment)

## Frontend Architecture

### New Components

All under `src/app/routes/import/` (or `src/app/components/import/`):

#### ImportComponent (main page)
- Admin-only route at `/dashboard/import`
- Multi-step wizard flow:
  1. **Upload step** — drag-and-drop CSV upload (reuse ngx-dropzone pattern)
  2. **Mapping step** — for each Seamstress field, a dropdown to select which CSV column maps to it
  3. **Preview step** — table showing items to be created/updated/inactivated with details
  4. **Result step** — summary of what was imported

#### Navigation
- Add "Import" link to sidebar (`links.component.html`) visible only for admin role

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

- All endpoints check Admin role before processing
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
