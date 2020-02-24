<script>
    import * as serviceService from "../../../Business/serviceService";
    import {link} from 'svelte-spa-router';

    const services = serviceService.getServices();
    const linkAll = serviceService.getLinkAll();

    window.scrollTo(0,0);
</script>

<h1 class="title">Métiers et compétences</h1>
<div class="content">
    Nos offres de service se présentent de la façon suivante :
    <br>
    <ul>
        {#each services as service }
        <li>{service.label}</li>
        {/each}
    </ul>
    Nos collaborateurs sont <b>certifiés</b> dans leurs différents domaines de compétences : <b>Microsoft Exchange, Office 365, SharePoint, Skype, Azure, Windows Server, Windows 10, KEMP...</b>
    L'équipe compte parmi elle des collaborateurs <b>certifiés MCT</b> (Microsoft Certified Trainer).
    <br>
    <a href={linkAll.url} use:link>
        {linkAll.name}
    </a>
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
    margin: 10px 0px;
  }

  a:hover {
    background-position: right center;
  }

  .content {
    width: 70%;
    margin-left: 15%;
    margin-bottom: 1%;
  }

  ul {
    list-style-image: url("../images/puce.png");
  }

  li {
    line-height: 3;
  }
</style>