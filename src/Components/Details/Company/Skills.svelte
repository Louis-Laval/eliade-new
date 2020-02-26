<script>
    import DataBI from "./Skills/DataBI.svelte";

    window.scrollTo(0,0);
</script>

<div class="section grey-bgcolor">
  <h1 class="title">Pôles de compétences</h1>
  <h1 class="subtitle">Data/BI</h1>
  <DataBI />
  <br>
  <h1 class="subtitle">Infrastructure/Identité/Communication</h1>
  <br>
  <h1 class="subtitle">Solutions collaboratives</h1>
</div>

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

  .subtitle {
    text-align: center;
    font-size: 2rem;
  }

  .subtitle::before {
    content: "";
    background: linear-gradient(90deg, #1a98ff 0%, #005fab 100%);
    height: 5px;
    width: 150px;
    margin-left: auto;
    margin-right: auto;
    display: block;
    transform: translateY(55px);
  }
</style>