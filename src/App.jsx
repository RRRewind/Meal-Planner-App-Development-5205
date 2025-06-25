import React,{useState,useEffect} from 'react';
import {HashRouter as Router,Routes,Route,Navigate} from 'react-router-dom';
import {motion,AnimatePresence,LazyMotion,domAnimation,MotionConfig} from 'framer-motion';
import Navigation from './components/Navigation';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Recipes from './pages/Recipes';
import Calendar from './pages/Calendar';
import ShoppingList from './pages/ShoppingList';
import FloatingTimer from './components/FloatingTimer';
import ImportRecipeModal from './components/ImportRecipeModal';
import {AuthProvider,useAuth} from './context/AuthContext';
import {MealPlanProvider} from './context/MealPlanContext';
import {TimerProvider} from './context/TimerContext';
import {useRecipeImporter} from './hooks/useRecipeImporter';
import './App.css';

// Loading Component
const LoadingScreen=()=> ( 
<div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
<div className="text-center">
<div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
<div className="w-8 h-8 bg-white rounded-lg"></div>
</div>
<p className="text-gray-600 font-medium">Loading...</p>
</div>
</div>
);

// Enhanced Recipe Import Handler Component
const RecipeImportHandler=({children})=> {
const [importRequest,setImportRequest]=useState(null);
const [isImporting,setIsImporting]=useState(false);

useEffect(()=> {
// Listen for recipe import requests from WordPress
const handleImportRequest=(event)=> {
console.log('🍽️ Recipe import request received:',event.data);
console.log('🔍 Event origin:',event.origin);
console.log('🔍 Event data type:',event.data?.type);

// Accept from trusted WordPress domains
const trustedDomains=[
'https://supertastyrecipes.com',
'https://www.supertastyrecipes.com',
'http://localhost',
'https://localhost'
];

const isTrustedDomain=trustedDomains.some(domain=> 
event.origin.startsWith(domain.replace('https://','').replace('http://','').replace('www.',''))
);

if (!isTrustedDomain) {
console.warn('🚫 Untrusted origin:',event.origin);
// For development,we'll be more permissive
if (!event.origin.includes('localhost') && !event.origin.includes('supertastyrecipes')) {
return;
}
}

if (event.data && event.data.type==='IMPORT_RECIPE') {
console.log('✅ Valid import request received');
console.log('📊 Recipe data:',event.data.recipe);
setImportRequest(event.data.recipe);
setIsImporting(true);

// Show immediate feedback
console.log('🎉 Import modal will open');
}
};

// Add message listener
window.addEventListener('message',handleImportRequest,false);

// Check URL for import parameter
const checkUrlForImport=()=> {
const urlParams=new URLSearchParams(window.location.search);
const hashParams=new URLSearchParams(window.location.hash.substring(2)); // Remove #/

const importParam=urlParams.get('import') || hashParams.get('import');
console.log('🔍 Checking URL for import parameter:',importParam);

if (importParam==='pending' || importParam==='true') {
console.log('📥 Import parameter detected,waiting for recipe data...');
// Show a waiting message
setIsImporting(true);
setImportRequest({pending: true});
}
};

// Check immediately and after hash changes
checkUrlForImport();
window.addEventListener('hashchange',checkUrlForImport);

// Set global flag to indicate meal planner is ready
window.mealPlannerReady=true;
console.log('🍽️ Meal Planner ready for imports');

return ()=> {
window.removeEventListener('message',handleImportRequest);
window.removeEventListener('hashchange',checkUrlForImport);
};
},[]);

const clearImportRequest=()=> {
setImportRequest(null);
setIsImporting(false);
// Clean up URL
const cleanUrl=window.location.origin + window.location.pathname + '#/';
window.history.replaceState({},document.title,cleanUrl);
};

return (
<>
{children}
{/* Enhanced Import Modal */}
<AnimatePresence>
{isImporting && (
<ImportRecipeModal 
isOpen={isImporting}
onClose={clearImportRequest}
recipeData={importRequest?.pending ? null : importRequest}
isPending={importRequest?.pending || false}
/>
)}
</AnimatePresence>
</>
);
};

// OAuth Callback Handler
const OAuthCallbackHandler=({children})=> {
useEffect(()=> {
const handleOAuthCallback=()=> {
const urlParams=new URLSearchParams(window.location.search);
const hashParams=new URLSearchParams(window.location.hash.substring(1));
const hasOAuthParams=urlParams.has('code') || urlParams.has('access_token') || 
hashParams.has('access_token') || urlParams.has('error');

if (hasOAuthParams) {
console.log('🔗 OAuth callback detected,cleaning URL...');
const cleanUrl=window.location.origin + window.location.pathname;
window.history.replaceState({},document.title,cleanUrl + '#/');
setTimeout(()=> {
if (window.location.hash !=='#/') {
window.location.hash='#/';
}
},100);
}
};

handleOAuthCallback();
},[]);

return children;
};

// Detect mobile device
const useIsMobile=()=> {
const [isMobile,setIsMobile]=useState(false);

useEffect(()=> {
const checkMobile=()=> {
setIsMobile(window.innerWidth < 768);
};
checkMobile();
window.addEventListener('resize',checkMobile);
return ()=> window.removeEventListener('resize',checkMobile);
},[]);

return isMobile;
};

// Simplified mobile transitions
const getMobileTransition=(isMobile)=> {
if (isMobile) {
return {
initial: {opacity: 0},
animate: {opacity: 1},
exit: {opacity: 0},
transition: {duration: 0.15,ease: 'easeOut',type: 'tween'}
};
}
return {
initial: {opacity: 0,y: 10},
animate: {opacity: 1,y: 0},
exit: {opacity: 0,y: -10},
transition: {duration: 0.2,ease: 'easeOut',type: 'tween'}
};
};

// App Routes Component
const AppRoutes=()=> {
const {user,loading}=useAuth();
const isMobile=useIsMobile();

if (loading) {
return <LoadingScreen />;
}

// If user is not authenticated,show landing page
if (!user) {
return (
<RecipeImportHandler>
<Routes>
<Route path="/landing" element={<Landing />} />
<Route path="/*" element={<Navigate to="/landing" replace />} />
</Routes>
</RecipeImportHandler>
);
}

const pageTransition=getMobileTransition(isMobile);

return (
<LazyMotion features={domAnimation}>
<MotionConfig reducedMotion={isMobile ? "user" : "never"}>
<div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
<Navigation />
<main className="pt-20 pb-8">
<RecipeImportHandler>
<AnimatePresence mode="wait">
<Routes>
<Route path="/landing" element={<Navigate to="/" replace />} />
<Route path="/" element={<motion.div key="dashboard" {...pageTransition}><Dashboard /></motion.div>} />
<Route path="/recipes" element={<motion.div key="recipes" {...pageTransition}><Recipes /></motion.div>} />
<Route path="/calendar" element={<motion.div key="calendar" {...pageTransition}><Calendar /></motion.div>} />
<Route path="/shopping" element={<motion.div key="shopping" {...pageTransition}><ShoppingList /></motion.div>} />
<Route path="*" element={<Navigate to="/" replace />} />
</Routes>
</AnimatePresence>
</RecipeImportHandler>
</main>
<FloatingTimer />
</div>
</MotionConfig>
</LazyMotion>
);
};

function App() {
return (
<AuthProvider>
<TimerProvider>
<MealPlanProvider>
<Router>
<OAuthCallbackHandler>
<AppRoutes />
</OAuthCallbackHandler>
</Router>
</MealPlanProvider>
</TimerProvider>
</AuthProvider>
);
}

export default App;