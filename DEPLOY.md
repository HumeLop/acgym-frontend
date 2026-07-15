# Deploy

## Workflow

```text
release/*  → Deploy Staging (automático)
v*          → Deploy Production (automático)
main        → no dispara nada
```

Los triggers están configurados en `.github/workflows/` — staging escucha branches `release/*`, producción escucha tags `v*`.

## Release flow

### 1. Bump version y crear rama de release

Desde `develop`, actualiza `version` en `package.json` y agrega la entrada en `CHANGELOG.md`. Luego crea la rama:

```bash
git checkout develop
git pull
git checkout -b release/1.2.0
# ↑ editar package.json y CHANGELOG.md
git commit -am "chore: bump version to 1.2.0"
git push origin release/1.2.0
```

Esto dispara **Deploy Staging** automáticamente.

### 2. Validar en staging

Si hay bugs, corrige y pushea más commits a la misma rama:

```bash
git commit -am "fix: ajuste en release"
git push
```

Cada push vuelve a disparar Deploy Staging.

### 3. Crear PR a main

Cuando staging está validado, abre un PR desde `release/*` hacia `main` en GitHub:
`https://github.com/{owner}/{repo}/compare/main...release/1.2.0`

Revísalo y fúsionalo. Esto **no dispara nada** — producción solo escucha tags.

### 4. Taggear y publicar a producción

Después del merge, actualiza `main` local y tagea:

```bash
git checkout main
git pull
git tag v1.2.0
git push origin v1.2.0
```

Esto dispara **Deploy Production** automáticamente.

### 5. Sincronizar develop (recomendado)

Para que `develop` tenga los fixes que se hicieron en la rama de release:

```bash
git checkout develop
git merge main
git push
```
