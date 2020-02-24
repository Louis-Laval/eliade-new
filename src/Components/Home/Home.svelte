<script>
  import Banner from "./Banner/Banner.svelte";
  import Sections from "./Sections/Sections.svelte";
  import Social from "./Social/Social.svelte";

  import * as offerService from "../../Business/offerService";
  import * as serviceService from "../../Business/serviceService";
  import * as partnerService from "../../Business/partnerService";
  import * as companyService from "../../Business/companyService";
  import { getSocialData, getBannerData } from "../../Business/commonService";
</script>

<!-- Banner -->
<Banner bannerData={getBannerData()} />
<!-- Company -->
<Sections section="company" heading="Notre entreprise"  sectionList={companyService.getCompany()}/>
<!-- Services -->
<Sections section="services" heading="Nos services" backgroundColor="grey-bgcolor" linkAll={serviceService.getLinkAll()}  sectionList={serviceService.getServices()}/>
<!-- Offers -->
<Sections section="offers" heading="Nos offres" sectionList={offerService.getOffers()}/>
<!-- Partners -->
<Sections section="partners" heading="Nos partenaires" backgroundColor="grey-bgcolor" linkAll={partnerService.getLinkAll()} sectionList={partnerService.getPartners()}/>
<!-- Social Media -->
<Social socialData={getSocialData()} />
