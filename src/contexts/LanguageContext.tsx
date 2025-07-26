import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.generator': 'Generator',
    'nav.library': 'Library',
    'nav.pricing': 'Pricing',
    'nav.learn': 'Learn',
    'nav.profile': 'Profile',
    'nav.chat': 'Chat',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    
    // Home page
    'home.title': 'AI-Powered UX Prompt Generator',
    'home.subtitle': 'Generate contextual, highly customizable prompts to assist UX designers at every stage of all major UX frameworks.',
    'home.cta.generate': 'Generate Prompts',
    'home.cta.learn': 'Learn More',
    
    // Generator
    'generator.title': 'Prompt Generator',
    'generator.subtitle': 'Generate AI prompts personalized for UX following a step-by-step process',
    'generator.loading.title': 'Generating your personalized prompt',
    'generator.loading.subtitle': 'This will only take a few seconds...',
    'generator.loading.analyzing': 'Analyzing context',
    'generator.loading.framework': 'Adapting to framework',
    'generator.loading.generating': 'Generating AI prompt',
    'generator.loading.complete': 'Ready!',
    'generator.loading.tip': 'Your prompt will be specific for {industry} and optimized for {tool}',
    'generator.result.title': 'Prompt Generated!',
    'generator.result.subtitle': 'Your personalized prompt is ready to use with ChatGPT, Claude or other AI tools',
    'generator.result.copy': 'Copy',
    'generator.result.use': 'Use Prompt',
    'generator.result.regenerate': 'Regenerate',
    'generator.result.save': 'Save',
    'generator.result.export': 'Export',
    'generator.result.new': 'New Prompt',
    'generator.result.library': 'View Library',
    'generator.result.continue': 'Continue in Chat',
    'generator.result.ai_response': 'AI Response',
    
    // Project Selection
    'project.selection.title': 'Which project will you generate prompts for?',
    'project.selection.subtitle': 'Choose whether to create a new project or continue with an existing one',
    'project.selection.new': 'New Project',
    'project.selection.new_desc': 'Create a project from scratch and configure all details',
    'project.selection.existing': 'Existing Project',
    'project.selection.existing_desc': 'Continue working on a project you already have created',
    'project.new.title': 'Create New Project',
    'project.new.subtitle': 'Define the name and description of your new UX project',
    'project.new.name': 'Project Name',
    'project.new.name_placeholder': 'e.g.: Mobile App Redesign, Client Portal, etc.',
    'project.new.description': 'Description (Optional)',
    'project.new.description_placeholder': 'Briefly describe the objective and scope of your project...',
    'project.existing.title': 'Select Existing Project',
    'project.existing.subtitle': 'Choose an existing project to continue adding prompts',
    'project.existing.empty': 'You have no projects created yet',
    'project.existing.create_first': 'Create my first project',
    
    // Project Context
    'context.title': 'Project Context',
    'context.subtitle': 'Tell us about your project to generate the most relevant prompts',
    'context.industry': 'What industry is your project in?',
    'context.company_size': 'What type of company is it?',
    'context.product_type': 'What type of product are you designing?',
    'context.product_scope': 'What is the scope of your product?',
    'context.user_profile': 'Who is your target audience?',
    
    // Project Stage
    'stage.title': 'Project Stage',
    'stage.subtitle': 'What stage is your project currently in?',
    'stage.current': 'Current Stage: {stage}',
    
    // Framework
    'framework.title': 'UX Framework',
    'framework.subtitle': 'Do you use any specific UX methodology in your project?',
    'framework.recommendation': 'Recommendation:',
    'framework.question': 'What UX framework do you use?',
    'framework.stage_question': 'What stage of {framework} are you in?',
    'framework.stage_note': 'Based on your project stage ({stage}), we have preselected the most appropriate stage.',
    'framework.none': 'I don\'t use a framework',
    'framework.none_desc': 'We work freely without specific methodology',
    'framework.none_tooltip': 'We will help you suggest the most suitable framework for your situation',
    
    // Tools
    'tools.title': 'UX Tool Selection',
    'tools.subtitle': 'What tool or methodology do you want to work with?',
    'tools.generate': 'Generate Prompt',
    
    // Usage Limits
    'usage.plan.guest': 'Guest',
    'usage.plan.free': 'Free',
    'usage.plan.premium': 'Premium',
    'usage.guest_desc': '2 monthly prompts for unregistered users',
    'usage.free_desc': '6 monthly prompts free',
    'usage.premium_desc': 'Unlimited access with your API key',
    'usage.prompts_used': 'Prompts used this month',
    'usage.limit_reached': 'You have reached your monthly limit.',
    'usage.limit_free': 'Configure an API key for unlimited access.',
    'usage.limit_guest': 'Register to get more free prompts.',
    'usage.unlimited': 'Unlimited access activated',
    'usage.upgrade': 'Upgrade',
    
    // Profile
    'profile.title': 'My Profile',
    'profile.subtitle': 'Configure your personal information and OpenAI API key',
    'profile.loading': 'Loading profile...',
    'profile.email': 'Email',
    'profile.display_name': 'Display Name',
    'profile.display_name_placeholder': 'Your full name',
    'profile.api_key': 'OpenAI API Key',
    'profile.api_key_note': '(Required to generate AI responses)',
    'profile.api_key_placeholder': 'sk-...',
    'profile.api_key_help': 'Get your API key at',
    'profile.save': 'Save Changes',
    'profile.saving': 'Saving...',
    'profile.projects.title': 'My Projects',
    'profile.projects.subtitle': 'Manage all your UX projects and their generated prompts',
    'profile.projects.new': 'New Project',
    'profile.projects.empty': 'You have no projects created yet',
    'profile.projects.create_first': 'Create my first project',
    'profile.projects.prompts': 'prompts',
    
    // Auth
    'auth.title': 'Welcome',
    'auth.subtitle': 'Sign in to your account or create a new one',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.sign_in': 'Sign In',
    'auth.sign_up': 'Sign Up',
    'auth.or': 'or',
    'auth.no_account': 'Don\'t have an account?',
    'auth.have_account': 'Already have an account?',
    
    // Common
    'common.continue': 'Continue',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.loading': 'Loading...',
    'common.copied': 'Copied!',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.recommended': 'Recommended',
    
    // Errors and Messages
    'error.generic': 'An error occurred',
    'error.loading_profile': 'Error loading profile',
    'error.updating_profile': 'Error updating profile',
    'error.loading_projects': 'Error loading projects',
    'error.creating_project': 'Error creating project',
    'success.profile_updated': 'Profile updated successfully',
    'success.project_created': 'Project created successfully',
    'success.prompt_generated': 'Prompt generated with AI!',
    'success.prompt_saved': 'Prompt saved to project',
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.generator': 'Generador',
    'nav.library': 'Biblioteca',
    'nav.pricing': 'Precios',
    'nav.learn': 'Aprender',
    'nav.profile': 'Perfil',
    'nav.chat': 'Chat',
    'nav.logout': 'Cerrar Sesión',
    'nav.login': 'Iniciar Sesión',
    
    // Home page
    'home.title': 'Generador de Prompts UX con IA',
    'home.subtitle': 'Genera prompts contextuales y altamente personalizables para asistir a diseñadores UX en cada etapa de los principales frameworks UX.',
    'home.cta.generate': 'Generar Prompts',
    'home.cta.learn': 'Aprende Más',
    
    // Generator
    'generator.title': 'Generador de Prompts',
    'generator.subtitle': 'Genera prompts de IA personalizados para UX siguiendo un proceso paso a paso',
    'generator.loading.title': 'Generando tu prompt personalizado',
    'generator.loading.subtitle': 'Esto tomará solo unos segundos...',
    'generator.loading.analyzing': 'Analizando contexto',
    'generator.loading.framework': 'Adaptando al framework',
    'generator.loading.generating': 'Generando prompt IA',
    'generator.loading.complete': '¡Listo!',
    'generator.loading.tip': 'Tu prompt será específico para {industry} y optimizado para {tool}',
    'generator.result.title': '¡Prompt Generado!',
    'generator.result.subtitle': 'Tu prompt personalizado está listo para usar con ChatGPT, Claude u otras herramientas de IA',
    'generator.result.copy': 'Copiar',
    'generator.result.use': 'Usar Prompt',
    'generator.result.regenerate': 'Regenerar',
    'generator.result.save': 'Guardar',
    'generator.result.export': 'Exportar',
    'generator.result.new': 'Nuevo Prompt',
    'generator.result.library': 'Ver Biblioteca',
    'generator.result.continue': 'Continuar en Chat',
    'generator.result.ai_response': 'Respuesta de IA',
    
    // Project Selection
    'project.selection.title': '¿Para qué proyecto vas a generar prompts?',
    'project.selection.subtitle': 'Elige si quieres crear un nuevo proyecto o continuar con uno existente',
    'project.selection.new': 'Nuevo Proyecto',
    'project.selection.new_desc': 'Crea un proyecto desde cero y configura todos los detalles',
    'project.selection.existing': 'Proyecto Existente',
    'project.selection.existing_desc': 'Continúa trabajando en un proyecto que ya tienes creado',
    'project.new.title': 'Crear Nuevo Proyecto',
    'project.new.subtitle': 'Define el nombre y descripción de tu nuevo proyecto UX',
    'project.new.name': 'Nombre del Proyecto',
    'project.new.name_placeholder': 'Ej: Rediseño de App Móvil, Portal de Cliente, etc.',
    'project.new.description': 'Descripción (Opcional)',
    'project.new.description_placeholder': 'Describe brevemente el objetivo y alcance de tu proyecto...',
    'project.existing.title': 'Seleccionar Proyecto Existente',
    'project.existing.subtitle': 'Elige un proyecto existente para continuar agregando prompts',
    'project.existing.empty': 'No tienes proyectos creados aún',
    'project.existing.create_first': 'Crear mi primer proyecto',
    
    // Project Context
    'context.title': 'Contexto del Proyecto',
    'context.subtitle': 'Cuéntanos sobre tu proyecto para generar los prompts más relevantes',
    'context.industry': '¿En qué industria está tu proyecto?',
    'context.company_size': '¿Qué tipo de empresa es?',
    'context.product_type': '¿Qué tipo de producto estás diseñando?',
    'context.product_scope': '¿Cuál es el alcance de tu producto?',
    'context.user_profile': '¿Quién es tu audiencia objetivo?',
    
    // Project Stage
    'stage.title': 'Etapa del Proyecto',
    'stage.subtitle': '¿En qué etapa se encuentra actualmente tu proyecto?',
    'stage.current': 'Etapa Actual: {stage}',
    
    // Framework
    'framework.title': 'Framework UX',
    'framework.subtitle': '¿Utilizas alguna metodología UX específica en tu proyecto?',
    'framework.recommendation': 'Recomendación:',
    'framework.question': '¿Qué framework UX utilizas?',
    'framework.stage_question': '¿En qué etapa del {framework} estás?',
    'framework.stage_note': 'Basado en tu etapa de proyecto ({stage}), hemos preseleccionado la etapa más apropiada.',
    'framework.none': 'No uso framework',
    'framework.none_desc': 'Trabajamos de forma libre sin metodología específica',
    'framework.none_tooltip': 'Te ayudaremos a sugerir el framework más adecuado para tu situación',
    
    // Tools
    'tools.title': 'Selección de Herramienta UX',
    'tools.subtitle': '¿Con qué herramienta o metodología quieres trabajar?',
    'tools.generate': 'Generar Prompt',
    
    // Usage Limits
    'usage.plan.guest': 'Invitado',
    'usage.plan.free': 'Gratuito',
    'usage.plan.premium': 'Premium',
    'usage.guest_desc': '2 prompts mensuales para usuarios no registrados',
    'usage.free_desc': '6 prompts mensuales gratuitos',
    'usage.premium_desc': 'Acceso ilimitado con tu API key',
    'usage.prompts_used': 'Prompts usados este mes',
    'usage.limit_reached': 'Has alcanzado tu límite mensual.',
    'usage.limit_free': 'Configura una API key para acceso ilimitado.',
    'usage.limit_guest': 'Regístrate para obtener más prompts gratuitos.',
    'usage.unlimited': 'Acceso ilimitado activado',
    'usage.upgrade': 'Upgrade',
    
    // Profile
    'profile.title': 'Mi Perfil',
    'profile.subtitle': 'Configura tu información personal y API key de OpenAI',
    'profile.loading': 'Cargando perfil...',
    'profile.email': 'Email',
    'profile.display_name': 'Nombre para mostrar',
    'profile.display_name_placeholder': 'Tu nombre completo',
    'profile.api_key': 'API Key de OpenAI',
    'profile.api_key_note': '(Requerida para generar respuestas con IA)',
    'profile.api_key_placeholder': 'sk-...',
    'profile.api_key_help': 'Obtén tu API key en',
    'profile.save': 'Guardar Cambios',
    'profile.saving': 'Guardando...',
    'profile.projects.title': 'Mis Proyectos',
    'profile.projects.subtitle': 'Gestiona todos tus proyectos de UX y sus prompts generados',
    'profile.projects.new': 'Nuevo Proyecto',
    'profile.projects.empty': 'No tienes proyectos creados aún',
    'profile.projects.create_first': 'Crear mi primer proyecto',
    'profile.projects.prompts': 'prompts',
    
    // Auth
    'auth.title': 'Bienvenido',
    'auth.subtitle': 'Inicia sesión en tu cuenta o crea una nueva',
    'auth.email': 'Email',
    'auth.password': 'Contraseña',
    'auth.sign_in': 'Iniciar Sesión',
    'auth.sign_up': 'Registrarse',
    'auth.or': 'o',
    'auth.no_account': '¿No tienes una cuenta?',
    'auth.have_account': '¿Ya tienes una cuenta?',
    
    // Common
    'common.continue': 'Continuar',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.cancel': 'Cancelar',
    'common.close': 'Cerrar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.loading': 'Cargando...',
    'common.copied': '¡Copiado!',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.recommended': 'Recomendado',
    
    // Errors and Messages
    'error.generic': 'Ocurrió un error',
    'error.loading_profile': 'Error al cargar el perfil',
    'error.updating_profile': 'Error al actualizar el perfil',
    'error.loading_projects': 'Error al cargar los proyectos',
    'error.creating_project': 'Error al crear el proyecto',
    'success.profile_updated': 'Perfil actualizado exitosamente',
    'success.project_created': 'Proyecto creado exitosamente',
    'success.prompt_generated': '¡Prompt Generado con IA!',
    'success.prompt_saved': 'Prompt guardado en el proyecto',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage first, then default to English
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const t = (key: string): string => {
    try {
      const keys = key.split('.');
      let value: any = translations[language];
      
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = value[k];
        } else {
          return key; // Return key if path doesn't exist
        }
      }
      
      return typeof value === 'string' ? value : key;
    } catch (error) {
      console.error('Translation error for key:', key, error);
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};