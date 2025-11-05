# Configuración Centralizada de la Aplicación

Este documento explica cómo usar el sistema de configuración parametrizable de la aplicación.

## Archivos de Configuración

### 1. `config.ts`
Archivo principal que contiene toda la configuración de la aplicación en TypeScript.

**Estructura:**
```typescript
export const AppConfig = {
  company: { ... },      // Información de la empresa
  colors: { ... },       // Colores de la aplicación
  titles: { ... },       // Títulos y textos
  contact: { ... },      // Información de contacto
  cssVariables: { ... }  // Variables CSS
};
```

### 2. `config.css`
Archivo CSS que define variables CSS globales que pueden ser actualizadas dinámicamente.

**Uso:**
```css
:root {
  --color-primary: #8B5CF6;
  --color-primary-dark: #7C3AED;
  /* ... más variables */
}
```

### 3. `config.service.ts`
Servicio Angular que gestiona la configuración dinámicamente.

## Cómo Cambiar Colores

### Opción 1: Cambiar en el archivo `config.ts` (Estático)
Edita directamente los valores en `config.ts`:

```typescript
export const AppConfig = {
  colors: {
    primary: '#8B5CF6',        // Cambiar aquí
    primaryDark: '#7C3AED',    // Cambiar aquí
    // ...
  }
};
```

### Opción 2: Cambiar dinámicamente en tiempo de ejecución
Usa el `ConfigService` en cualquier componente:

```typescript
import { ConfigService } from './services/config.service';

export class MyComponent {
  constructor(private configService: ConfigService) {}

  changeColor() {
    // Cambiar un color específico
    this.configService.updateColor('colors.primary', '#FF6B6B');
    
    // O actualizar múltiples colores
    this.configService.updateConfig({
      colors: {
        primary: '#FF6B6B',
        primaryDark: '#FF5252',
        // ...
      }
    });
  }
}
```

## Cómo Cambiar Títulos

### Opción 1: Cambiar en el archivo `config.ts` (Estático)
```typescript
export const AppConfig = {
  titles: {
    pageTitle: 'Mi Nuevo Título',
    mainTitle: 'Catálogo de Productos',
    subtitle: 'Mi Empresa',
    logoAlt: 'Logo de mi empresa',
  }
};
```

### Opción 2: Cambiar dinámicamente
```typescript
this.configService.updateTitle('titles.subtitle', 'Nuevo Subtítulo');
```

### Opción 3: Usar en componentes
En `app.component.ts`:
```typescript
import { getTitle } from './config';

export class AppComponent {
  appTitle = getTitle('titles.mainTitle');
  appSubtitle = getTitle('titles.subtitle');
}
```

En `app.component.html`:
```html
<h1>{{ appTitle }}</h1>
<h2>{{ appSubtitle }}</h2>
```

## Cómo Usar Variables CSS

Todos los archivos CSS ahora usan variables CSS en lugar de colores hardcodeados:

```css
.button {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.button:hover {
  background-color: var(--color-primary-dark);
}
```

## Estructura de Colores

| Variable | Descripción | Valor Actual |
|----------|-------------|--------------|
| `--color-primary` | Color primario (morado) | #8B5CF6 |
| `--color-primary-dark` | Color primario oscuro | #7C3AED |
| `--color-primary-light` | Color primario claro (rgba) | rgba(139, 92, 246, 0.1) |
| `--color-primary-light-border` | Color primario claro para bordes | rgba(139, 92, 246, 0.2) |
| `--color-error` | Color de error | #d32f2f |
| `--color-success` | Color de éxito | #25d366 |
| `--color-background` | Color de fondo principal | #f8edde |
| `--color-text-primary` | Color de texto principal | #333 |

## Estructura de Títulos

| Ruta | Descripción | Valor Actual |
|------|-------------|--------------|
| `titles.pageTitle` | Título de la página | Catálogo de Productos El Retorno |
| `titles.mainTitle` | Título principal | Catálogo de Productos |
| `titles.subtitle` | Subtítulo | El Retorno |
| `titles.logoAlt` | Texto alternativo del logo | El Retorno |

## Ejemplo Completo: Cambiar Tema

Para cambiar completamente el tema de la aplicación:

```typescript
import { ConfigService } from './services/config.service';

export class SettingsComponent {
  constructor(private configService: ConfigService) {}

  switchToOrangeTheme() {
    this.configService.updateConfig({
      colors: {
        primary: '#FF8C00',
        primaryDark: '#E67E00',
        primaryLight: 'rgba(255, 140, 0, 0.1)',
        primaryLightBorder: 'rgba(255, 140, 0, 0.2)',
      },
      titles: {
        pageTitle: 'Catálogo de Productos Jugos del Uruguay',
        mainTitle: 'Catálogo de Productos',
        subtitle: 'Jugos del Uruguay',
        logoAlt: 'Jugos del Uruguay',
      }
    });
  }

  switchToPurpleTheme() {
    this.configService.updateConfig({
      colors: {
        primary: '#8B5CF6',
        primaryDark: '#7C3AED',
        primaryLight: 'rgba(139, 92, 246, 0.1)',
        primaryLightBorder: 'rgba(139, 92, 246, 0.2)',
      },
      titles: {
        pageTitle: 'Catálogo de Productos El Retorno',
        mainTitle: 'Catálogo de Productos',
        subtitle: 'El Retorno',
        logoAlt: 'El Retorno',
      }
    });
  }
}
```

## Ventajas del Sistema

✅ **Centralizado**: Todos los colores y títulos en un solo lugar  
✅ **Parametrizable**: Fácil de cambiar sin tocar CSS  
✅ **Dinámico**: Cambios en tiempo de ejecución  
✅ **Mantenible**: Menos duplicación de código  
✅ **Escalable**: Fácil de agregar nuevos parámetros  
✅ **Consistente**: Garantiza consistencia en toda la aplicación

## Próximos Pasos

1. Importa `ConfigService` donde necesites cambiar configuración
2. Usa `updateColor()` o `updateTitle()` para cambios específicos
3. Usa `updateConfig()` para cambios múltiples
4. Observa `config$` para reaccionar a cambios de configuración

```typescript
this.configService.config$.subscribe(config => {
  console.log('Configuración actualizada:', config);
});
```
