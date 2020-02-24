<script>
  export let bannerData = {};
  const { title, description, tutorialUrl, watchTutorial } = bannerData;
</script>
<!------------------------------------------->
<!----------------MARKUP----------------------->
<!------------------------------------------->
<section class="main-bgcolor">
  <div class="flex-container">
    <div class="blog w40">
      <div class="image" style="background-image:url('images/ptit-dej.png')">
      </div>
      <div class="white-thumbnail right-align">
        <b>Petit-déjeuner SÉCURITÉ<br>10/03/2020<br>8h15 - 10h30</b><br>Ensemble, démarrons la journée du MARDI 10 MARS 2020 de 8h15 à 10h30 sur la thématique de la SÉCURITÉ
      </div>
    </div>

    <div class="blog w30">
      <div class="image" style="background-image:url('images/team-hands-linked-together.jpg')">
      </div>
      <div class="transparent-thumbnail">
        <b>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</b>
      </div>
    </div>

    <div class="blog-container w30">
      <div class="mini-blog">
        <div class="image" style="background-image:url('images/business-team-meeting-boardroom.jpg')"></div>
        <div class="white-thumbnail center-align">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
      </div>
      <div class="mini-blog mt15">
        <div class="image" style="background-image:url('images/finger-pointing-at-javascript-code.jpg')"></div>
        <div class="white-thumbnail center-align">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
      </div>
    </div>
  </div>
</section>
<!------------------------------------------->
<!----------------STYLE----------------------->
<!------------------------------------------->
<style>
  .blog, .blog-container {
    height: 490px;
    margin: 15px 7.5px;
    position: relative;
    overflow: hidden;
  }

  .mini-blog {
    height: 237.5px;
    position: relative;
    overflow: hidden;
  }

  .w40 {
    width: 40%;
  }

  .w30 {
    width: 30%;
  }

  .mt15 {
    margin-top: 15px;
  }

  .image {
    height: 100%;
    background-size: cover;
    background-position: 50% 50%;
    transition: 0.5s;
  }

  .blog:hover div.image, .mini-blog:hover div.image {
    transform: scale(1.2);
  }

  .white-thumbnail {
    bottom: 0;
    position: absolute;
    width: 80%;
    background: white;
    padding: 3%;
    /* border: solid 2px black; */
  }

  .right-align {
    right: 0;
  }

  .center-align {
    right: 10%;
  }

  .transparent-thumbnail {
    position: absolute;
    bottom: 50%;
    width: 100%;
    text-align: center!important;
    color: white;
    padding: 20%;
    transform: translateY(50%);
  }

  section {
    padding: 1% 0%;
  }

  .flex-container {
    display: flex;
  }
</style>