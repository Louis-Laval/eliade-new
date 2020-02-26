<script>
    import * as offerService from "../../Business/offerService";
    import GoData from "./Offers/GoData.svelte";
    import GoFast from "./Offers/GoFast.svelte";
    import GoSmart from "./Offers/GoSmart.svelte";
    import GoTeams from "./Offers/GoTeams.svelte";
    import GoAccessSecurity from "./Offers/GoAccessSecurity.svelte";
    import GoFinops from "./Offers/GoFinops.svelte";

    export let params = {};
    let currentOffer = { label: "Aucune offre !", page: ""};
    const offers = offerService.getOffers();
    if(params.offer){
        let offer = offers.find(o => o.page.includes(params.offer));
        if(offer){
            currentOffer = offer;
        }
    }
    
    window.scrollTo(0,0);
</script>

<h1 class="title">{currentOffer.label}</h1>
{#if params.offer === "go-data"}
  <GoData />
{:else if params.offer === "go-fast"}
  <GoFast />
{:else if params.offer === "go-smart"}
  <GoSmart />
{:else if params.offer === "go-teams"}
  <GoTeams />
{:else if params.offer === "go-access-security"}
  <GoAccessSecurity />
{:else if params.offer === "go-finops"}
  <GoFinops />
{:else}
  <p>Désolé, nous n'avons pas d'offre correspondant à votre demande <b>{params.offer}</b> !</p>
{/if}

<style>
  .title {
    text-align: center;
  }

  .title::before {
    content: "";
    background: linear-gradient(90deg, #1a98ff 0%, #005fab 100%);
    height: 5px;
    width: 200px;
    margin-left: auto;
    margin-right: auto;
    display: block;
    transform: translateY(69.5px);
  }

  .title::after {
    content: "";
    background: linear-gradient(90deg, #1a98ff 0%, #005fab 100%);
    height: 10px;
    width: 50px;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 40px;
    display: block;
    transform: translateY(14px);
  }

  p {
    margin-left: 10%;
  }
</style>