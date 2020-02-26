<script>
  export let navlists = [];

  const scrollOrigin = 0;

  function scrollNavbar() {
    let nav = document.getElementById("nav");;
    nav.classList.add("navbar-scrolled");
    nav.classList.remove("navbar");
  }

  function resetNavbar(){
    var nav = document.getElementById("nav");
    nav.classList.remove("navbar-scrolled");
    nav.classList.add("navbar");
  }

  window.addEventListener('scroll', function(e) {
    if (window.scrollY > scrollOrigin) {
      window.requestAnimationFrame(function() {
        scrollNavbar();
      });
    }
    if (window.scrollY === scrollOrigin) {
      window.requestAnimationFrame(function() {
        resetNavbar();
      });
    }

  });

</script>
<!------------------------------------------->
<!----------------MARKUP----------------------->
<!------------------------------------------->
<section id="nav-bar">
  <nav class="navbar navbar-expand-md" id="nav">
    <a class="navbar-brand company_brand" href="/#">
      <img src="images/logo.png" alt="logo Eliade" style="width: 100%">
    </a>
    <button
      class="navbar-toggler"
      type="button"
      data-toggle="collapse"
      data-target="#navbarNav"
      aria-controls="navbarNav"
      aria-expanded="false"
      aria-label="Toggle navigation">
      <span class="navbar-toggler-icon" />
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ml-auto">
        {#each navlists as list}
          <li class="nav-item" >
            <a class="nav-link" href={list.url}>{list.label}</a>
          </li>
        {/each}
      </ul>
    </div>
  </nav>
</section>
<!------------------------------------------->
<!----------------STYLE----------------------->
<!------------------------------------------->
<style>
  #nav-bar {
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .navbar {
    padding: 0 20px !important;
    background: linear-gradient(to top,rgba(230, 230, 230, 0.8) 0,rgba(0, 100, 184, 0.2) 100%);
    transition: 1s;
  }

  .navbar-nav li a {
    font-weight: 600;
    text-transform: uppercase;
    float: right;
    text-align: left;
  }

</style>