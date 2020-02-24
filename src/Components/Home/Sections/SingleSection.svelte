<script>
  import {link} from 'svelte-spa-router';

  export let section;
</script>
  {#if section.page}
    <div class="col-md-4 section link">
      <a href={section.page} use:link class="partner-link">
          <img src={section.image} alt={section.label} class="section-img" />
          <h4>{section.label}</h4>
          <p>{section.description}</p>
      </a>
    </div>
  {:else}
    <div class="col-md-4 section">
      <img src={section.image} alt={section.label} class="section-img" />
      <h4>{section.label}</h4>
      <p>{section.description}</p>
    </div>
  {/if}
<style>
  .partner-link{
    color: black;
  }

  .section-img {
    width: 200px;
    height: 200px;
    margin-top: 20px;
  }

  .section h4 {
    padding: 5px;
    margin-top: 25px;
    text-transform: uppercase;
  }

  a {
    text-decoration: none;
  }

  .link:hover {
    box-shadow: 10px 10px 20px 5px #b2c7d1;
  }
</style>