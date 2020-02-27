<script>
  import Banner from "./Banner/Banner.svelte";
  import Sections from "./Sections/Sections.svelte";
  import Social from "./Social/Social.svelte";

  import * as offerService from "../../Business/offerService";
  import * as serviceService from "../../Business/serviceService";
  import * as partnerService from "../../Business/partnerService";
  import * as companyService from "../../Business/companyService";
  import { getSocialData } from "../../Business/commonService";
</script>

<Banner />
<Sections section="company" heading="Notre entreprise"  sectionList={companyService.getCompany()}/>
<Sections section="services" heading="Nos services" backgroundColor="main-bgcolor" linkAll={serviceService.getLinkAll()}  sectionList={serviceService.getServices()}/>
<Sections section="offers" heading="Nos offres" sectionList={offerService.getOffers()}/>
<Sections section="partners" heading="Nos partenaires" backgroundColor="main-bgcolor" linkAll={partnerService.getLinkAll()} sectionList={partnerService.getPartners()}/>
<Social socialData={getSocialData()} />
