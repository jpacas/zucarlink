# Componentes de Registro - Estrategia de Modularización

## Componentes Creados

Este directorio contiene componentes modulares extraídos del archivo `Register.tsx` para mejorar la mantenibilidad del código.

### 1. UserTypeSelector.tsx
Componente que muestra las tres opciones de tipo de usuario:
- Usuarios de Ingenios
- Empresas Proveedoras
- Usuarios de Empresas Proveedoras

**Props:**
- `onSelect: (userType: 'ingenio' | 'proveedor' | 'empresa_proveedora') => void` - Callback cuando se selecciona un tipo de usuario

**Uso:**
```tsx
<UserTypeSelector onSelect={(type) => handleUserTypeSelection(type)} />
```

### 2. PlanSelector.tsx
Componente que muestra los planes de pago disponibles y permite seleccionar uno.

**Props:**
- `plans: Plan[]` - Array de planes disponibles
- `selectedPlan: Plan | null` - Plan actualmente seleccionado
- `onSelectPlan: (plan: Plan) => void` - Callback cuando se selecciona un plan
- `onBack: () => void` - Callback para volver atrás

**Uso:**
```tsx
<PlanSelector
  plans={plans}
  selectedPlan={selectedPlan}
  onSelectPlan={(plan) => setSelectedPlan(plan)}
  onBack={() => setFormPart(1)}
/>
```

## Componentes Pendientes de Crear

Para completar la refactorización de `Register.tsx` (1919 líneas), se recomienda crear los siguientes componentes adicionales:

### 3. PersonalInfoForm.tsx
Formulario para la información personal del usuario:
- Nombre, apellido, email
- País, área
- Fecha de nacimiento
- Avatar
- Contraseña

**Props sugeridos:**
```tsx
interface PersonalInfoFormProps {
  formData: FormData
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAutocompleteChange: (field: string, value: any) => void
  paises: string[]
  areas: Area[]
  showPassword: boolean
  onTogglePassword: () => void
  onAvatarDrop: (files: File[]) => void
  avatarPreview: string | null
  onNext: () => void
  onBack: () => void
}
```

### 4. CompanyInfoForm.tsx
Formulario para información de la empresa (para empresas proveedoras):
- Descripción
- País
- Página web
- Logo

**Props sugeridos:**
```tsx
interface CompanyInfoFormProps {
  formData: FormData
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAutocompleteChange: (field: string, value: any) => void
  paises: string[]
  onLogoDrop: (files: File[]) => void
  logoPreview: string | null
  onNext: () => void
  onBack: () => void
}
```

### 5. RegistrationStepper.tsx
Componente para mostrar el progreso del registro:
- Mostrar pasos completados
- Indicador visual del paso actual

### 6. FormField.tsx
Componente reutilizable para campos de formulario con estilos consistentes:
```tsx
interface FormFieldProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  required?: boolean
  multiline?: boolean
  rows?: number
}
```

## Estrategia de Refactorización

### Paso 1: Identificar Secciones Independientes
- ✅ Selección de tipo de usuario (UserTypeSelector)
- ✅ Selección de plan (PlanSelector)
- ⏳ Formulario de información personal
- ⏳ Formulario de información de empresa
- ⏳ Paso de pago
- ⏳ Confirmación de registro

### Paso 2: Extraer Lógica Compartida
Crear hooks personalizados para:
- `useRegistrationForm` - Manejo del estado del formulario
- `useFileUpload` - Manejo de carga de archivos (avatar, logo)
- `useRegistrationValidation` - Validación de formulario

### Paso 3: Simplificar el Componente Principal
El archivo `Register.tsx` debería quedar reducido a ~200-300 líneas, actuando como orquestador que:
- Maneja el flujo entre pasos
- Mantiene el estado global del registro
- Renderiza los componentes apropiados según el paso actual

### Ejemplo de estructura simplificada:
```tsx
const Register: React.FC = () => {
  const [step, setStep] = useState<'initial' | 'form' | 'payment'>('initial')
  const [userType, setUserType] = useState<UserType | null>(null)
  // ... otros estados

  if (step === 'initial') {
    return <UserTypeSelector onSelect={handleUserTypeSelection} />
  }

  if (step === 'form') {
    if (formPart === 1) {
      return <PersonalInfoForm {...props} />
    }
    if (formPart === 2) {
      return <CompanyInfoForm {...props} />
    }
  }

  if (step === 'payment') {
    return <PaymentForm {...props} />
  }
}
```

## Beneficios de la Refactorización

1. **Mantenibilidad**: Cada componente es más fácil de entender y modificar
2. **Testabilidad**: Los componentes pequeños son más fáciles de testear
3. **Reutilización**: Los componentes pueden usarse en otros lugares
4. **Rendimiento**: React puede optimizar mejor componentes pequeños
5. **Colaboración**: Múltiples desarrolladores pueden trabajar en diferentes componentes simultáneamente

## Próximos Pasos

1. Crear los componentes pendientes (PersonalInfoForm, CompanyInfoForm, etc.)
2. Extraer la lógica de formulario a hooks personalizados
3. Actualizar Register.tsx para usar los nuevos componentes
4. Agregar tests unitarios para cada componente
5. Documentar cada componente con ejemplos de uso
