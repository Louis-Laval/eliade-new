<script>
  export let footerData = {};
  export let header = "";
  const {
    description,
    contactDetails,
    subscribeNewsletter,
    subscribe
  } = footerData;
  const { title, address, mobile, email } = contactDetails;
</script>

<!------------------------------------------->
<!----------------MARKUP----------------------->
<!------------------------------------------->
<section class="main-bgcolor" id="contacts">
  <div class="container">
    <div class="row section-body">
      <div class="col-md-4 footer-box">
        <div class="company_brand">{header}</div>
        <p>{description}</p>
      </div>
      <div class="col-md-4 footer-box">
        <p class="footer-title">{title}</p>
        <p>
          <i class="fas fa-map-marker-alt" />
          {@html address}
        </p>
        <p>
          <i class="fas fa-phone" />
          {mobile}
        </p>
        <p>
          <i class="fas fa-envelope" />
          {email}
        </p>
      </div>
      <div class="col-md-4 footer-box">
        <p class="footer-title">{subscribeNewsletter}</p>
        <input
          type="email"
          class="form-control round-border"
          placeholder="Votre adresse email" />
        <button type="button" class="btn btn-primary round-border">
          {subscribe}
        </button>
      </div>
    </div>
  </div>
</section>
<!------------------------------------------->
<!----------------Style----------------------->
<!------------------------------------------->
<style>
  .footer-title {
    font-weight: bold;
    text-transform: uppercase;
  }

  .footer-box button {
    margin-top: 30px;
  }

  .round-border {
    border-radius: 20px !important;
  }

  .btn-primary {
    box-shadow: none;
    border: none;
    background-size: 200% auto;
    background-image: linear-gradient(90deg, #1a98ff 0%, #005fab 51%, #1a98ff 100%);
    border: #1a98ff;
    text-align: center;
    display: flex;
    transition: 0.5s;
  }

  .btn-primary:hover {
    background-position: right center;
  }
</style>