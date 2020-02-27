import Home from '../Components/Home/Home.svelte';
import Partners from '../Components/Details/Partners.svelte';
import Services from '../Components/Details/Services.svelte';
import Certifications from '../Components/Details/Company/Certifications.svelte';
import Skills from '../Components/Details/Company/Skills.svelte';
import Recruiting from '../Components/Details/Company/Recruiting.svelte';
import Offers from '../Components/Details/Offers.svelte';

export const routes = {
    "/": Home,
    "/company/recruiting": Recruiting,
    "/company/certifications": Certifications,
    "/company/skills": Skills,
    "/services/:service?": Services,
    "/offers/:offer?": Offers,
    "/partners/:id?": Partners
}