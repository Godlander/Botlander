exports.run = async (client, message, args) => {
    message.react('👀')
      .then((msg) => {
          setTimeout(function(){
              message.delete().catch(O_o=>{});
          }, 1000)
      });
};

exports.data = {
    help: -1,
    name: "hihixd",
    text: "[>hihixd][👀]"
};