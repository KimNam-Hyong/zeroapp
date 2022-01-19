document.querySelector("#list-menu").addEventListener("click", async () => {
  $("#side-bar").animate({
    left: "0%",
  });
  $("#side-bar-back").css("display", "block");
});

document.querySelector("#side-bar-back").addEventListener("click", async () => {
  $("#side-bar").animate({
    left: "-80%",
  });
  $("#side-bar-back").css("display", "none");
});

function number_format(number) {
  var regexp = /\B(?=(\d{3})+(?!\d))/g;
  return number.toString().replace(regexp, ",");
}
