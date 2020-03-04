<script>
  import {link} from 'svelte-spa-router';

  export let section;
  export let backgroundColor = "";
</script>
  {#if section.page}
    <div class="col-md-4 section {backgroundColor}-link">
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

  .light-color-link, .main-bgcolor-link {
    transition: 0.7s;
  }

  .light-color-link:hover {
    box-shadow: 10px 10px 20px 5px #b2c7d1cb;
  }

  .main-bgcolor-link:hover {
    box-shadow: 10px 10px 20px 5px #1a98ffc9;
  }

  h4 {
    font-size: 1.2rem;
  }
</style>