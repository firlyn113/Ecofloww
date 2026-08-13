# API Documentation — EcoFlow AI

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All endpoints (except `/health`) require Firebase JWT token in `Authorization: Bearer <token>` header.

---

## Health & Status

### GET /health
Health check endpoint.
```
Response: 200 OK
{ "status": "ok" }
```

---

## Batches (Fermentation Management)

### POST /batches
Create a new fermentation batch.
```
Request:
{
  "name": "Batch 1",
  "waste_weight_kg": 5.0,
  "water_liters": 15.0,
  "sugar_kg": 2.5,
  "start_date": "2026-08-01T10:00:00Z"
}

Response: 201 Created
{
  "status": "success",
  "data": {
    "id": 1,
    "user_id": "uid",
    "name": "Batch 1",
    "status": "pending",
    "waste_weight_kg": 5.0,
    "water_liters": 15.0,
    "sugar_kg": 2.5,
    "start_date": "2026-08-01T10:00:00Z",
    "created_at": "2026-08-01T13:00:00Z"
  }
}
```

### GET /batches
List all batches for the authenticated user. Supports pagination.
```
Query params:
- limit (optional, default 100): number of items per page
- offset (optional, default 0): starting position

Response: 200 OK
{
  "status": "success",
  "data": {
    "batches": [
      { "id": 1, "name": "Batch 1", "status": "pending", ... },
      { "id": 2, "name": "Batch 2", "status": "harvested", ... }
    ],
    "total": 15,
    "limit": 100,
    "offset": 0,
    "has_more": false
  }
}
```

### GET /batches/{batch_id}
Get batch details.
```
Response: 200 OK
{
  "status": "success",
  "data": { "id": 1, "name": "Batch 1", ... }
}
```

### GET /batches/{batch_id}/dashboard
Get batch dashboard (metrics, milestones, harvest alerts).
```
Response: 200 OK
{
  "status": "success",
  "data": {
    "batch": { ... },
    "latest_health_score": 85.0,
    "upcoming_milestones": ["Day 30 checkpoint", "Harvest ready"],
    "harvest_alert": true
  }
}
```

---

## Fermentation Logs

### POST /batches/{batch_id}/logs
Add a fermentation log entry.
```
Request:
{
  "log_date": "2026-08-02T10:00:00Z",
  "aroma": "sweet",
  "color": "amber",
  "gas_presence": true,
  "temperature_c": 28.5,
  "notes": "Fermenting well"
}

Response: 201 Created
{
  "status": "success",
  "data": {
    "id": 1,
    "batch_id": 1,
    "ai_status": "Normal",
    "ai_confidence": 0.92,
    "created_at": "2026-08-02T13:00:00Z"
  }
}
```

### GET /batches/{batch_id}/logs
List all logs for a batch. Supports pagination.
```
Query params:
- limit (optional, default 50): number of items per page
- offset (optional, default 0): starting position

Response: 200 OK
{
  "status": "success",
  "data": {
    "logs": [
      { "id": 1, "log_date": "...", "aroma": "sweet", ... },
      { "id": 2, "log_date": "...", "aroma": "sour", ... }
    ],
    "total": 25,
    "limit": 50,
    "offset": 0,
    "has_more": false
  }
}
```

---

## Product Recommendations

### POST /batches/{batch_id}/recommendation
Get product recommendations based on batch harvest characteristics.
```
Request:
{
  "harvest_date": "2026-08-30T10:00:00Z",
  "harvest_volume_liters": 20.0,
  "final_color": "amber",
  "aroma_intensity": "sweet",
  "user_intent": "household"
}

Response: 201 Created
{
  "status": "success",
  "message": "Product recommendations generated",
  "data": {
    "recommendations": [
      {
        "product_id": 3,
        "name": "Liquid Fertilizer",
        "compatibility_score": 92.5,
        "description": "Liquid Fertilizer product recommendation",
        "processing_instruction_summary": "Use for liquid fertilizer applications"
      },
      ...
    ]
  }
}
```

### POST /batches/{batch_id}/select-product
Select a recommended product to generate roadmap.
```
Request:
{
  "product_template_id": 3
}

Response: 200 OK
{
  "status": "success",
  "message": "Product selected successfully",
  "data": { "selected_product_id": 3 }
}
```

### POST /check-ingredient-ratio
Check ingredient ratio deviation (water/sugar vs ideal).
```
Request:
{
  "waste_kg": 5.0,
  "water_liters": 15.0,
  "sugar_kg": 2.5
}

Response: 200 OK
{
  "status": "success",
  "message": "Ratio check complete",
  "data": {
    "ideal_water_liters": 15.0,
    "ideal_sugar_kg": 2.5,
    "deviation_warning": false
  }
}
```

---

## Business Analysis

### POST /batches/{batch_id}/business-analysis
Run financial analysis for a product.
```
Request:
{
  "product_name": "Liquid Fertilizer",
  "production_volume_liters": 20.0,
  "target_market": "agricultural_retail",
  "packaging_type": "bottle_1l",
  "distribution_channel": "retail",
  "raw_material_cost": 50000,
  "packaging_cost": 30000,
  "labor_cost": 20000,
  "overhead_cost": 10000,
  "monthly_fixed_costs": 100000,
  "regional_average_price": 75000
}

Response: 201 Created
{
  "status": "success",
  "data": {
    "cogs_per_unit": 4500,
    "srp_recommended": 6750,
    "gross_margin_percent": 33.3,
    "monthly_revenue_conservative": 1350000,
    "monthly_profit_conservative": 450000,
    "breakeven_units": 15,
    "sensitivity_analysis": { ... }
  }
}
```

### GET /batches/{batch_id}/business-analysis/report
Download financial analysis as PDF.
```
Response: 200 OK (application/pdf)
[PDF content]
```

---

## Roadmap (Processing Guide)

### POST /batches/{batch_id}/roadmap
Create a roadmap for producing the selected product.
```
Request:
{
  "product_template_id": 3
}

Response: 201 Created
{
  "status": "success",
  "message": "Roadmap created successfully",
  "data": {
    "id": 1,
    "batch_id": 1,
    "product_template_id": 3,
    "status": "not_started",
    "current_step": 0,
    "steps": [
      { "step": 1, "title": "Prepare equipment", "duration_hours": 2, ... },
      { "step": 2, "title": "Mix ingredients", "duration_hours": 1, ... }
    ]
  }
}
```

### GET /batches/{batch_id}/roadmap
Get roadmap details.
```
Response: 200 OK
{
  "status": "success",
  "data": { "id": 1, "status": "not_started", ... }
}
```

### PUT /batches/{batch_id}/roadmap/steps/{step_index}
Update roadmap step status.
```
Request:
{
  "completed": true
}

Response: 200 OK
{
  "status": "success",
  "message": "Step updated successfully",
  "data": { ... }
}
```

### GET /batches/{batch_id}/roadmap/report
Download roadmap checklist as PDF.
```
Response: 200 OK (application/pdf)
[PDF content]
```

### GET /roadmap/templates/{template_id}
Get roadmap template (steps, safety warnings, processing details).
```
Response: 200 OK
{
  "status": "success",
  "data": {
    "template_id": 3,
    "name": "Liquid Fertilizer",
    "steps": [ ... ],
    "safety_warnings": "..."
  }
}
```

---

## Environmental Impact

### GET /impact/user
Get cumulative environmental impact for the authenticated user.
```
Response: 200 OK
{
  "status": "success",
  "data": {
    "total_waste_kg": 50.0,
    "co2_avoided_kg": 95.0,
    "waste_diverted_percentage": 100.0
  }
}
```

### GET /batches/{batch_id}/impact
Get environmental impact for a specific batch.
```
Response: 200 OK
{
  "status": "success",
  "data": {
    "batch_id": 1,
    "waste_diverted_kg": 5.0,
    "co2_avoided_kg": 9.5,
    "formula_kg_co2_per_kg_waste": 1.9
  }
}
```

---

## Admin — Communities

### GET /admin/communities
List all communities (scoped by role: admin sees all, community_admin sees own).
```
Response: 200 OK
{
  "status": "success",
  "data": {
    "communities": [
      { "id": 1, "name": "Jakarta Community", "region": "Jakarta Selatan", ... },
      { "id": 2, "name": "Bandung Community", "region": "Bandung", ... }
    ]
  }
}
```

### POST /admin/communities
Create a new community.
```
Request:
{
  "name": "Surabaya Community",
  "region": "East Java"
}

Response: 201 Created
{
  "status": "success",
  "data": { "id": 3, "name": "Surabaya Community", ... }
}
```

---

## Admin — Statistics & Reports

### GET /admin/community-stats
Get statistics for a community (members, batches, waste processed, success rates).
```
Query params: ?community_id=1&start_date=2026-07-01&end_date=2026-08-01

Response: 200 OK
{
  "status": "success",
  "data": {
    "total_users": 10,
    "total_batches": 25,
    "total_waste_processed_kg": 100.0,
    "success_rate_percentage": 92.0,
    "normal_logs": 45,
    "caution_logs": 3,
    "failed_logs": 2,
    "engagement": { "log_adoption_percentage": 75.0, ... }
  }
}
```

### GET /admin/community-trends
Get trend data (30-day series) for a community.
```
Query params: ?community_id=1&days=30

Response: 200 OK
{
  "status": "success",
  "data": {
    "days": 30,
    "trends": [
      { "date": "2026-07-03", "logs": 5, "normal": 4, "success_rate_percentage": 80.0 },
      { "date": "2026-07-04", "logs": 6, "normal": 6, "success_rate_percentage": 100.0 }
    ]
  }
}
```

### GET /admin/community-compliance-report
Download compliance report (statistics + trends) as CSV.
```
Query params: ?community_id=1&start_date=2026-07-01&end_date=2026-08-01

Response: 200 OK (text/csv)
[CSV content]
```

---

## Admin — Product Templates

### GET /admin/product-templates
List all product templates.
```
Response: 200 OK
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Household Cleaner",
      "description": "General-purpose eco-enzyme cleaner",
      "time_estimate_hours": 24,
      "base_compatibility_score": 0.85
    }
  ]
}
```

### POST /admin/product-templates
Create a new product template.
```
Request:
{
  "name": "New Product",
  "description": "Description",
  "processing_instructions": "Steps",
  "ingredients": ["ingredient1", "ingredient2"],
  "equipment": ["equipment1"],
  "time_estimate_hours": 48,
  "safety_warnings": "Warnings",
  "base_compatibility_score": 0.9
}

Response: 201 Created
{
  "status": "success",
  "data": { "id": 9, ... }
}
```

### PATCH /admin/product-templates/{template_id}
Update a product template.
```
Request: { "name": "Updated name", ... }

Response: 200 OK
{
  "status": "success",
  "message": "Product template updated",
  "data": { "id": 9, ... }
}
```

### DELETE /admin/product-templates/{template_id}
Delete a product template.
```
Response: 200 OK
{
  "status": "success",
  "message": "Product template deleted"
}
```

---

## Admin — Model Metrics

### GET /admin/model-metrics
Get AI/ML model performance metrics (computed from database).
```
Response: 200 OK
{
  "status": "success",
  "data": {
    "total_predictions": 150,
    "normal_logs": 140,
    "caution_logs": 8,
    "failed_logs": 2,
    "success_rate_percentage": 93.3,
    "average_health_score": 0.88,
    "uptime_percentage": 99.9
  }
}
```

---

## Admin — User Management

### PATCH /admin/users/{user_id}/role
Update a user's role.
```
Request:
{
  "role": "admin" | "community_admin" | "platform_admin" | "user"
}

Response: 200 OK
{
  "status": "success",
  "message": "User role updated to admin",
  "data": { "user_id": "uid", "role": "admin" }
}
```

---

## File Upload

### POST /upload
Upload an image (fermentation log photo, product image).
```
Multipart form-data:
- file: <image file> (MIME: image/jpeg, image/png, max 5MB)

Response: 200 OK
{
  "status": "success",
  "data": {
    "file_url": "http://minio:9000/ecoflow-bucket/logs/uuid.jpg",
    "file_size_bytes": 102400
  }
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "status": "error",
  "message": "Error description",
  "detail": "Additional context"
}
```

Common HTTP status codes:
- 200 OK — request successful
- 201 Created — resource created
- 400 Bad Request — invalid input
- 401 Unauthorized — missing/invalid token
- 403 Forbidden — insufficient permissions
- 404 Not Found — resource not found
- 429 Too Many Requests — rate limit exceeded
- 500 Internal Server Error — server error

---

## Pagination

**Status:** List endpoints (`GET /api/v1/batches`, admin list endpoints) saat ini mengembalikan **seluruh data** (tanpa `limit`/`offset` params). Pagination query params direncanakan sebagai peningkatan pasca-MVP jika data per user melebihi ~100 record.

---

## Rate Limiting
- **Limit:** 60 requests per minute per IP
- **Headers:** Check `RateLimit-Remaining`, `RateLimit-Reset` in response
- **Fallback:** In-memory counter if Redis unavailable

## Authentication & Authorization
- **Auth method:** Firebase JWT
- **Roles:** `user` (default), `admin`, `community_admin`, `platform_admin`
- **Admin routes:** Require `admin` or `platform_admin` role
- **Community routes:** `community_admin` scoped to own community
