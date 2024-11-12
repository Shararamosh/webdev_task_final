document.addEventListener("DOMContentLoaded", init_sidenav_mobile)
document.addEventListener("DOMContentLoaded", messages_data_to_message_elements)
$("#messages_collection").on("click", ".message_delete", function() {
  message_id = $(this)[0].parentElement.parentElement.id
  delete_message(message_id)
})
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  });
}
message_submit_btn = document.getElementById("message_submit")
message_submit_btn.addEventListener("click", upload_message_data)
function init_sidenav_mobile() {
  var elems = document.querySelectorAll(".sidenav");
  M.Sidenav.init(elems);
}
function upload_message_data() {
  nickname_input = document.getElementById("nickname_input")
  if (nickname_input == null || !nickname_input.checkValidity())
    return
  message_input = document.getElementById("message_input")
  if (message_input == null || !nickname_input.checkValidity())
    return
  avatar_input = document.getElementById("avatar_input")
  let nickname = nickname_input.value
  let message = message_input.value
  console.log(nickname+" написал:")
  console.log(message)
  if (avatar_input.files.length < 1) {
    send_message_data(nickname, message, "")
    return;
  }
  let file = avatar_input.files[0];
  getBase64(file).then(file_base64 => send_message_data(nickname, message, file_base64))
}
function send_message_data(nickname, message, avatar) {
  fetch("send_message.php",
    {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify({"nickname": nickname, "message": message, "avatar": avatar})
    })
  .then(response => response.json())
  .then(data => {
    if (data == undefined)
      console.log("Сообщение отослано, но вместо ответа в POST получен undefined.")
    else if (data == null)
      console.log("Сообщение отослано, но вместо ответа в POST получен null.")
    else
    {
      console.log("Отослано сообщение:")
      console.log(data)
      add_message_data(data)
    }
  })
  .catch(error => console.log(error))
}
function add_message_data(message_data) {
  messages_collection = document.getElementById("messages_collection")
  if (messages_collection == null)
    return
  let message_element = create_message_element(message_data.id, message_data.nickname, message_data.message, message_data.avatar)
  messages_collection.appendChild(message_element)
  messages_collection.hidden = false;
  conditional_hide_messages_empty_text(true)
}
function conditional_hide_messages_collection(){
  messages_collection = document.getElementById("messages_collection")
  b = false
  if (messages_collection != null)
  {
    messages_collection.hidden = (messages_collection.children.length < 1);
    b = !messages_collection.hidden
  }
  conditional_hide_messages_empty_text(b)
}
function conditional_hide_messages_empty_text(do_hide)
{
  empty_text = document.getElementById("messages_empty_text")
  if (empty_text != null)
    empty_text.hidden = do_hide
}
function remove_element_by_id(id) {
  let element = document.getElementById(id)
  if (element != null)
    element.remove()
}
function messages_data_to_message_elements() {
  fetch("send_message.php",
    {
      method: "GET",
      headers: {
        "Accept": "application/json; charset=UTF-8",
      }
    }
  )
  .then(response => response.json())
  .then(data => {
    if (data == undefined)
      console.log("Вместо сообщений в GET получен undefined.")
    else if (data == null)
      console.log("Вместо сообщений в GET получен null.")
    else
    {
      console.log("Получены сообщения:")
      console.log(data)
      for (let message_data of data)
        add_message_data(message_data)
    }
  })
  .catch(error => console.log(error))
}
function create_message_element(id, nickname, message, avatar) {

  if (id < 0 || nickname == "" || message == "")
    return ""
  if (avatar == "" || avatar == undefined) {
    avatar_num = getRandomInt(8)+1
    avatar = "images/avatars/GenericAvatar"+avatar_num.toString()+".png"
  }
  message_element = document.createElement("li")
  message_element.setAttribute("class", "collection-item avatar")
  user_img = document.createElement("img")
  user_img.setAttribute("src", avatar)
  user_img.setAttribute("class", "circle")
  message_element.appendChild(user_img)
  message_sender = document.createElement("spawn")
  message_del_btn = document.createElement("a")
  message_del_btn.setAttribute("href", "#")
  message_del_btn.setAttribute("class", "message_delete")
  message_del_btn_img = document.createElement("i")
  message_del_btn_img.setAttribute("class", "red-text material-icons right")
  message_del_btn_img.innerHTML += "delete"
  message_del_btn.appendChild(message_del_btn_img)
  message_sender.appendChild(message_del_btn)
  message_sender_nickname = document.createElement("p")
  message_sender_nickname.innerHTML += nickname
  message_sender.appendChild(message_sender_nickname)
  message_element.appendChild(message_sender)
  user_message = document.createElement("p")
  user_message.setAttribute("class", "user_message")
  user_message.innerHTML += message
  message_element.setAttribute("id", "message_"+id.toString())
  message_element.appendChild(user_message)
  return message_element
}
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
function delete_message(element_id) {
  message_id = element_id.slice(8)
  console.log("Удаление сообщения с id "+message_id+".")
  fetch("send_message.php", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({"id": message_id})
  })
  .then(response => response.json())
  .then(data => {
    if (data == undefined)
      console.log("В DELETE вместо индекса сообщения получено undefined.")
    else if (data == null)
      console.log("В DELETE вместо индекса сообщения получено null.")
    else
    {
      console.log("Получен индекс на удаление:")
      console.log(data)
      remove_element_by_id("message_"+data["id"])
      conditional_hide_messages_collection()
    }
  })
  .catch(error => console.log(error))
}