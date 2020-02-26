<script>
    import * as partnerService from "../../Business/partnerService";
    import * as util from "../../Business/Common/util";
    import { beforeUpdate } from 'svelte';

    export let params = {};

    let currentVideo;
    let shouldDisplay;
    let nextVideo;
    let previousVideo;
    let click = false;

    let videos = partnerService.getPartners();

    let shouldDiplayVideo = (video) => {
        return !!video.url;
    };

    let updateCurrentDisplay = () => {
        shouldDisplay = shouldDiplayVideo(currentVideo);
        previousVideo = videos[util.getPreviousIndex(currentVideo.index, videos)];
        nextVideo = videos[util.getNextIndex(currentVideo.index, videos)];
    }

    let goToPreviousLink = () => {
        currentVideo = videos[util.getPreviousIndex(currentVideo.index, videos)];
        updateCurrentDisplay();
        click = true;
    };

    let goToNextLink = () => {
        currentVideo = videos[util.getNextIndex(currentVideo.index, videos)];
        updateCurrentDisplay();
        click = true;
    };

    let autoTurn = () => {
        if(!click){
            if(params.id){
                currentVideo = videos[params.id];
            }
            else {
                currentVideo = videos[0];
            }
            updateCurrentDisplay();
        }
    };

    beforeUpdate(autoTurn);

    window.scrollTo(0,0);
</script>

<div class="section resp-container grey-bgcolor">
    <button on:click={goToPreviousLink} class="btn btn-primary round-border"><i class="left"></i><div  class="button-label">{previousVideo.label}</div></button>
    {#if shouldDisplay}
        <iframe src={currentVideo.url} title={currentVideo.label} class="resp-iframe">
        </iframe>
    {/if}
    <div class="description">
        <h1>{currentVideo.label}</h1>
        <p>{@html currentVideo.text}</p>
    </div>
    <button on:click={goToNextLink} class="btn btn-primary round-border"><div class="button-label">{nextVideo.label}</div><i class="right"></i></button>
</div>

<style>
    .resp-container {
        position: relative;
        overflow: hidden;
        padding-top: 2%;
        height: 500px;
        display: flex;
    }

    .resp-iframe {
        position: relative;
        width: 50%;
        height: 88.5%;
        border: 0;
        top: 0;
        padding-top: 2%;
        padding-bottom: 0%;
    }
    
    .btn-primary {
        box-shadow: none;
        border: none;
        height: 10%;
        width: 7.5%;
        margin: 200px 10px 10px 10px;
        background-size: 200% auto;
        background-image: linear-gradient(90deg, #1a98ff 0%, #005fab 51%, #1a98ff 100%);
        border: #1a98ff;
        font-size: 70%;
        text-align: center;
        display: flex;
        transition: 0.5s;
    }

    .btn-primary:hover {
        background-position: right center;
    }

    .round-border {
        border-radius: 20px !important;
        padding: 8px 15px;
    }

    .description {
        width:35%;
        padding-top: 2%;
        padding-left: 1%;
        padding-right: 1%;
    }

    .right {
        transform: rotate(-45deg);
        -webkit-transform: rotate(-45deg);
    }

    .left {
        transform: rotate(135deg);
        -webkit-transform: rotate(135deg);
    }

    i {
        border: solid white;
        border-width: 0 3px 3px 0;
        display: inline-block;
        padding: 3px;
        margin-top: auto;
        margin-bottom: auto;
    }

    .button-label {
        margin: auto;
    }

    p {
        text-align: justify;
        font-size: 80%;
    }
</style>