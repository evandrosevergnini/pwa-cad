var deferredPrompt;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/service-worker.js")
  });
}

window.addEventListener("beforeinstallprompt", function (event) {
  event.preventDefault();
  deferredPrompt = event;
});

function ofereceInstalacaoComoPWA(event) {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function (choiceResult) {
      if (choiceResult.outcome === "dismissed") {
        console.log("Usuário não quis instalar o App");
      } else {
        console.log("Usuário adicionou o App à home screen");
      }
      deferredPrompt = null;
    });
  }
}
