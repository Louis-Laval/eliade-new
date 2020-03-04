<script>
  import Navbar from "./Components/Common/Navbar.svelte";
  import Footer from "./Components/Common/Footer.svelte";
  import Home from "./Components/Home/Home.svelte";
  import Router from "svelte-spa-router";
  import { routes } from "./Config/routes";
  import { getNavbarData, getFooterData, getHeader } from "./Business/commonService";
</script>

<!-- Navbar -->
<Navbar navlists={getNavbarData()} />
<!-- Banner -->
<Router {routes}/>
<!-- Footer -->
<Footer footerData={getFooterData()} header={getHeader()} />
