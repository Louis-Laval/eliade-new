<script>
    export let offer = { title: "", description: "", id: 1 };

    let collapse = () => {
        let content = document.getElementById("content" + offer.id);

        if(content.style.display === "none"){
            content.style.display = "block";
        }
        else {
            content.style.display = "none";
        }
    };

    
</script>

<button type="button" class="collapsible" on:click={collapse}><h3>{offer.title}</h3></button>
<div id="content{offer.id}" class="content" style="display: none">
    <h4>Qui sommes nous ?</h4>
    <p>Créée en 2001, Eliade est une société de services experte des solutions Microsoft, qui se place aujourd’hui comme un acteur incontournable dans la région des Hauts de France. En véritable apporteurs de solutions, nous accompagnons nos clients dans leur transformation digitale et prêtons une attention toute particulière au sens et à la qualité du service.</p>
    Société à taille humaine, nos consultants certifiés Microsoft accompagnent nos clients sur leurs domaines d’expertise :
    <ul>
        <li>Solutions collaboratives Microsoft</li>
        <li>Identité / Infrastructure Onprem-Cloud / Communication / Sécurité</li>
        <li>Data / BI / Développement .NET</li>
    </ul>

    <h4>Quelle opportunité ?</h4>
    <p>Nous nous développons, et pour cela, nous avons besoin de vous !<br>Rattaché(e) au Directeur Technique, Yann, vous aurez pour mission de prendre en charge les demandes d'incidents de nos clients au sein de notre équipe Manageo.</p>
    Vous ferez face à des challenges techniques et interviendrez sur les thématiques suivantes :
    <ul>
        <li>Qualification et traitement les incidents déclarés par nos clients (niveau 2/3)</li>
        <li>Suivi de l'incident jusqu'à la résolution par vos soins ou avec l'aide des Consultants d'Eliade si escalade</li>
        <li>Suivi des contrats de support (évolution de la consommation, date d'échéance, interlocuteurs...)</li>
        <li>Intervention sur site si la situation l'exige</li>
    </ul>
    <p>Vous serez également amené(e) à accompagner les consultants d'Eliade afin de suivre les prestations d'intégration et monter en compétences sur les solutions Microsoft.</p>
    
    <h4>Vous souhaitez nous rejoindre ?</h4>
    Vous ...
    <ul>
        <li>&Ecirc;tes issu(e) d’une formation bac +2/+3 ?</li>
        <li>Possédez une expérience de minimum 1 an sur un poste similaire ?</li>
        <li>Avez déjà appréhendé les technos suivantes : Office 365, Azure, AD, Exchange… ?</li>
        <li>&Ecirc;tes force de proposition, enthousiaste et passionné par le monde de l’IT ?</li>
        <li>Et surtout, vous avez la volonté de monter en compétence, de travailler dans une équipe soudée, où la proximité et l'écoute sont les maîtres-mots du quotidien ?</li>
    </ul>
    <p>Alors rejoignez-nous !<br><br>Petit bonus : Sportif(ve) ? Nos collaborateurs seront heureux de vous intégrer dans leurs programmes d’entrainement !</p>
    
    <h4>Quels avantages ?</h4>
    <ul>
        <li>Ordinateur portable, abonnement Office 365 E5 avec téléphonie Teams et souscription Azure</li>
        <li>Prise en charge des certifications Microsoft (voucher et préparation)</li>
        <li>Mutuelle familiale</li>
        <li>Tickets restaurants</li>
    </ul>
    
    <h4>C'est quoi la suite ?</h4>
    <h6>Vous êtes intéressé(e) ? Nous aussi !</h6>
    <p>Le processus de recrutement chez Eliade inclut l’ensemble des collaborateurs.<br>En plus de réunir un panel d’experts, nous estimons que la cohésion d’équipe importe tout autant que le savoir-faire technique.<br>À la suite d’un premier entretien téléphonique, vous serez amené(e) à rencontrer vos futur(e)s collègues pour échanger autour de vos domaines de compétences, votre expérience et vos autres passions.</p>
</div>

<style>
    .collapsible {
        background-image: linear-gradient(to bottom,#7a7c7f 0, #636568 51%, #7a7c7f 100%) !important;
        background-size: auto 200%;
        color: white;
        cursor: pointer;
        padding: 18px;
        width: 100%;
        border: none;
        text-align: left;
        outline: none;
        font-size: 15px;
        transition: 1s;
    }

    .collapsible:hover {
        background-position: center bottom;
    }

    .content {
        padding: 1%;
        overflow: hidden;
        background-color: #f1f1f1;
    }
</style>
