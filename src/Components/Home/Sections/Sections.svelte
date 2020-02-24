<script>
  export let heading;
  export let section;
  export let backgroundColor = "";
  export let linkAll = "";
  export let sectionList = [];
  
  import SingleSection from "./SingleSection.svelte";
  import {link} from 'svelte-spa-router';
</script>

<!------------------------------------------->
<!----------------MARKUP----------------------->
<!------------------------------------------->
<section id={section} class="section {backgroundColor}">
  <div class="container text-center">
    <h2 class="title text-center">{heading}</h2>
    <div class="row section-body centered-elts">
      {#each sectionList as sectionItem}
        <SingleSection section={sectionItem}/>
      {/each}
    </div>
    {#if linkAll.url}
    <a href={linkAll.url} use:link>
      {linkAll.name}
    </a>
    {/if}
  </div>
</section>

<!------------------------------------------->
<!----------------STYLE----------------------->
<!------------------------------------------->
<style>
  .centered-elts {
    display: flex;
    justify-content: center;
  }

  .title::before {
    content: "";
    background: linear-gradient(90deg, #1a98ff 0%, #005fab 100%);
    height: 5px;
    width: 200px;
    margin-left: auto;
    margin-right: auto;
    display: block;
    transform: translateY(60px);
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

  section {
    box-shadow: none;
    padding: 8px 25px;
    border: none;
  }

  a:link, a:visited {
    background-size: 200% auto;
    background-image: linear-gradient(90deg, #1a98ff 0%, #005fab 51%, #1a98ff 100%);
    color: white;
    border-radius: 20px !important;
    padding: 8px 15px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    transition: 0.5s;
    margin-bottom: 20px;
  }

  a:hover {
    background-position: right center;
  }
</style>
