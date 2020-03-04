<script>
    var indexes = Array.from(new Array(12),(val,index) => index + 1);
</script>

<h1 class="title">Nos certifications</h1>
<div class="row centered-elts">
    {#each indexes as index}
        <div class="elt">
            <img src="images/certifications/ms{index}.png" alt="ms{index}" class="image">
        </div>
    {/each}
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

  .centered-elts {
    display: flex;
    justify-content: center;
    width: 80%;
    margin-left: 10%;
    margin-bottom: 5%;
  }

  .elt {
    width: 23%;
    padding-top: 23%;
    position: relative;
    border: solid 2px black;
    margin: 1%;
  }

  .image {
    position: absolute;
    width: 100%;
    top: 0%;
  }

</style>