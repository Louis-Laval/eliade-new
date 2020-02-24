import Home from '../Components/Home/Home.svelte';
import Partners from '../Components/Details/Partners.svelte';
import Services from '../Components/Details/Services.svelte';
import Certifications from '../Components/Details/Company/Certifications.svelte';
import Skills from '../Components/Details/Company/Skills.svelte';

// import NotFound from './routes/NotFound.svelte'

export const routes = {
    "/": Home,
    "/partners": Partners,
    "/services": Services,
    "/company/certifications": Certifications,
    "/company/skills": Skills,
    // // Catch-all
    // // This is optional, but if present it must be the last
    // '*': NotFound,
}