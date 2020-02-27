<script>
    import Collapsible from "./Collapsible.svelte";

    let hiringOffers = [
        { title: "Ingénieur support Microsoft H/F", description: "", id: 1 },
        { title: "Ingénieur support Microsoft H/F", description: "Une description", id: 2 }
    ];
</script>

<h1 class="title">Nos offres d'emploi</h1>
<div class="offers">
    {#each hiringOffers as offer}
        <Collapsible offer={offer}/>
    {/each}
    <form class="form">
      <h4>Créer une nouvelle offre</h4>
      <label for="title">Titre de l'offre</label>
      <input type="text" id="title" name="title">
      <label for="opportunity">Quelle opportunité ?</label>
      <input type="text" id="opportunity" name="opportunity">
      <label for="join">Vous souhaitez nous rejoindre ?</label>
      <input type="text" id="join" name="join">
      <label for="advantages">Quels avantages ?</label>
      <input type="text" id="advantages" name="advantages">
      <label for="next">C'est quoi la suite ?</label>
      <input type="text" id="next" name="next">
      <input type="submit" class="round-border" value="Ajouter l'offre">
    </form>
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

  .offers {
    width: 70%;
    margin-left: 15%;
    margin-bottom: 3%;
  }

  input[type=text] {
    width: 100%;
    margin-bottom: 1%;
  }

  .form {
    padding: 2%;
    background-color: #f1f1f1;
    margin-top: 2%;
  }

  .round-border {
    border-radius: 20px !important;
    padding: 8px 15px;
    background-color: #636568;
    color: white;
    border: none;
  }

</style>