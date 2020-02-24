<script>
    import * as serviceService from "../../Business/serviceService";
    import DataBI from "./Services/DataBI.svelte";

    let services = serviceService.getServices();

    window.scrollTo(0,0);
</script>


{#each services as { label, text }}
    {#if label === "Data/BI"}
      <DataBI />
    {:else}
        <div class="section grey-bgcolor">
          <h1 class="title">{label}</h1>
          <p class="description">{@html text}</p>
        </div>
    {/if}
{/each}

<style>
  .description {
    width:70%;
    padding-top: 2%;
    padding-left: 1%;
    padding-right: 1%;
    text-align: justify;
    margin: auto;
  }

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
</style>