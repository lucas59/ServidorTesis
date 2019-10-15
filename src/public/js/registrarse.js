let form = document.querySelector(".form-register");
let progressOptions = document.querySelectorAll(".progressbar__option");

form.addEventListener("click", function(e) {
  let element = e.target;
  let isButtonNext = element.classList.contains("step__button--next");
  let isButtonBack = element.classList.contains("step__button--back");
  if (isButtonNext || isButtonBack) {
    let currentStep = document.getElementById("step-" + element.dataset.step);
    let jumpStep = document.getElementById("step-" + element.dataset.to_step);
    currentStep.addEventListener("animationend", function callback() {
      currentStep.classList.remove("active");
      jumpStep.classList.add("active");
      if (isButtonNext) {
        currentStep.classList.add("to-left");
        progressOptions[element.dataset.to_step - 1].classList.add("active");
      } else {
        jumpStep.classList.remove("to-left");
        progressOptions[element.dataset.step - 1].classList.remove("active");
      }
      currentStep.removeEventListener("animationend", callback);
    });
    currentStep.classList.add("inactive");
    jumpStep.classList.remove("inactive");
  }
});

function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function(e) {
      $("#fotoUsuario").attr("src", e.target.result);
    };

    reader.readAsDataURL(input.files[0]);
  }
}

$("#inputFoto").change(function() {
  readURL(this);
});

$("input[name='tipo']").click(e => {
  if (e.target.value == "empleado") {
    $("#inputApellido").show();
  } else {
    $("#inputApellido").hide();
  }
});

function validarRegistroUsuario() {
  var nombreuser = document.getElementsByName("username");
  var email = document.getElementsByName("email");
  var password = document.getElementsByName("password");
  var password2 = document.getElementsByName("password2");
  var nombre = document.getElementsByName("documento");
  var documento = document.getElementsByName("nombre");
  var apellido = document.getElementsByName("apellido");
  var tel = document.getElementsByName("tel");

  if (
    nombre == "" ||
    nombreuser == "" ||
    email == "" ||
    apellido == "" ||
    tel == "" ||
    password == "" ||
    password2 == "" ||
    documento == ""
  ) {
    return false;
  } else {
    return true;
  }
}
