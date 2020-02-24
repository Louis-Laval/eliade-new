<script>
  export let socialData = {};
  const { socials, title } = socialData;
</script>
<!------------------------------------------->
<!----------------MARKUP----------------------->
<!------------------------------------------->
<section id="social-media" class="section">
  <div class="container text-center">
    <h2 class="title text-center">{title}</h2>
    <div class="social-icons section-body">
      {#each socials as social}
        <a href={social.url} target="_blank">
          <img src={social.image} alt="Social media {social.image}" />
        </a>
      {/each}
    </div>
  </div>
</section>
<!------------------------------------------->
<!----------------STYLE----------------------->
<!------------------------------------------->
<style>
  .social-icons img {
    width: 75px;
    transition: 0.5s;
  }
  .social-icons a:hover img {
    transform: translateY(-10px);
  }
  a:hover {
    text-decoration: none;
  }
</style>