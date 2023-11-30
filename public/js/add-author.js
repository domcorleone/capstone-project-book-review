let photoElement = document.querySelector("#photo-path-id");
let visualizerBox = document.querySelector("#photo");
let output = "";
let inserted = "<%=locals.flagInserted%>";
let error_msg = "<%=locals.error%>";
let AuthorName = "<%=locals.author%>";
photoElement.addEventListener("change", () => {
  for (let i = 0; i < photoElement.files.length; i++) {
    output += photoElement.files[i].name;
  }
  alert(output);
  visualizerBox.setAttribute("src", photoElement.value);
});
window.addEventListener("load", () => {
  if (inserted === "true") {
    Swal.fire({
      title: "Info",
      text: `New Author ${AuthorName} was successfully created`,
      icon: "success",
    });
  } else if (error_msg.length > 0) {
    Swal.fire({
      title: "Error",
      text: error_msg,
      icon: "error",
    });
  }
});
// using jquery
// $(window).on("load",()=>{
//   alert("hello");
// });
