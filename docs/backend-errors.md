# Parteng Backend Errors

## 403: Error when creating an entity with missing properties

```json
{
  "title": "Forbidden",
  "type": "https://httpstatus.es/403",
  "status": 403,
  "detail": "Entity validation error",
  "errors": {
    "name": {
      "isEmpty": "Value is required and can't be empty"
    },
    "person_type": {
      "isEmpty": "Value is required and can't be empty"
    },
    "creation_projects_id": {
      "isEmpty": "Value is required and can't be empty"
    }
  }
}
```

## 409: Error when creating an entity that already exists

```json
{
  "title": "Conflict",
  "type": "https://httpstatus.es/409",
  "status": 409,
  "detail": "Entity conflicts with existing entity",
  // "errors" contain the existing entity
  "errors": {
    "comment": null,
    "fund_manager_id": null,
    "fund_types_id": null,
    "id": 1,
    "legal_entity_country_code": "",
    "legal_entity_identifier": "",
    "legal_entity_pending_registration": 1,
    "legal_entity_types_id": null,
    "name": "Puaud Kevin",
    "person_type": 3,
    "creation_projects_id": 1,
    "validation_status": 0,
    "status": 1,
    "created": 1641555249,
    "updated": 1641555249
  }
}
```

## 403: Error when creating a legal person

```json
{
  "title": "Forbidden",
  "type": "https://httpstatus.es/403",
  "status": 403,
  "detail": "Entity validation error",
  "errors": {
    "legal_entity_identifier": {
      "isEmpty": "Value is required and can't be empty"
    }
  }
}
```
