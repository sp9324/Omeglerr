const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

const socket = require('socket.io');
const io = socket(server,{
  cors: {
    origin: "*",
    methods: ["GET","POST"]
  }
});

// video chat
const availableUsers = [];  // these are the user that currently on our website
const wantToConnectUsers = []; // these are the user that want to connect to other user
const oncallUsers = [];  // these are the user that are currently on call

wantToConnectUsers.push("noUserfound");

const getRandomUser = (wantToConnectUsers) => {

  const index = wantToConnectUsers.length - 1;
  if(index == 0) return "noUserfound";
  else {
    const user = wantToConnectUsers[index];
    wantToConnectUsers.splice(index,1);
    return user;
  }
}

io.on("connection",socket => {

  const auth = socket.handshake.auth;
  if(auth.token === 'omeglerr '){
    socket.emit("me",socket.id);
    availableUsers.push(socket.id);
  }else {
    // console.log("socket is disconnected");
    socket.disconnect();
  }

  socket.on("wantToConnect",({id})=>{
    if(id == undefined || id == null || id == '') return;
    //console.log("my id is : ",id);

    if(wantToConnectUsers.length > 1){
      
      const user = getRandomUser(wantToConnectUsers);
      // in CASE some other user take off the user at that instant
      if(user == "noUserfound"){
        wantToConnectUsers.push(id);
        return;
      }
      if(user == socket.id){
        wantToConnectUsers.push(id);
        return;
      }
      //push both user inCall state
      oncallUsers.push(user);
      oncallUsers.push(socket.id);
      
      //console.log("userFound: ",user);
      io.to(user).emit("userFound",socket.id,true);
      io.to(socket.id).emit("userFound",user,false);
    }
    else {
      wantToConnectUsers.push(id);
    }
  })

  socket.on("joinCall",({signalData,id})=>{
    io.to(id).emit("acceptCall",signalData);
  })

  socket.on("callEnded",id => {
    //console.log("call ended ",id);
    if(oncallUsers.indexOf(id) != -1) {
      oncallUsers.splice(oncallUsers.indexOf(id),1);
    }
    if(oncallUsers.indexOf(socket.id) != -1) {
      oncallUsers.splice(oncallUsers.indexOf(socket.id),1);
    }
    if(id == undefined || id == null || id == '') return;
    io.to(id).emit("callEnded");
  });

  socket.on("disconnect",() => {
    
    if (availableUsers.indexOf(socket.id) > -1) {
      availableUsers.splice(availableUsers.indexOf(socket.id),1);
    } if(oncallUsers.indexOf(socket.id) > -1){
      oncallUsers.splice(oncallUsers.indexOf(socket.id),1);
    } if(wantToConnectUsers.indexOf(socket.id) > -1){
      wantToConnectUsers.splice(wantToConnectUsers.indexOf(socket.id),1);
    }
    // socket.broadcast.emit("callEnded");
  });

  socket.on('message', (data) => {
    socket.to(data.to).emit('message', data);
  });

});

// text chat

const textUserIo = io.of("/textUser");

const textChatUsers = [];
const wantToTextChat = [];
const onTextChatUsers = [];

wantToTextChat.push("noUserfound");

textUserIo.on('connection',socket => {
  // console.log("text user connected");
  const auth = socket.handshake.auth;
  if(auth.token === 'omeglerr'){
    socket.emit("me",socket.id);
    // console.log("text user connected: ", socket.id);
    textChatUsers.push(socket.id);
  }else {
    // console.log("text user disconnected");
    socket.disconnect();
  }

  socket.on("wantToConnect",({id})=>{
    if(id == undefined || id == null || id == '') return;
    if(wantToTextChat.length > 1){
      
      const user = getRandomUser(wantToTextChat);
      // in CASE some other user take off the user at that instant
      if(user == "noUserfound"){
        wantToTextChat.push(id);
        return;
      }
      if(user == socket.id){
        return;
      }
      //push both user inCall state
      onTextChatUsers.push(user);
      onTextChatUsers.push(socket.id);
      
      //console.log("text userFound: ",user);
      textUserIo.to(user).emit("userFound",socket.id);
      textUserIo.to(socket.id).emit("userFound",user);
    }
    else {
      wantToTextChat.push(id);
    }
  })

  socket.on("joinCall",({id})=>{
    textUserIo.to(id).emit("acceptCall");
  })

  socket.on("callEnded",id => {
    if(onTextChatUsers.indexOf(id) != -1) {
      onTextChatUsers.splice(onTextChatUsers.indexOf(id),1);
    }
    if(onTextChatUsers.indexOf(socket.id) != -1) {
      onTextChatUsers.splice(onTextChatUsers.indexOf(socket.id),1);
    }
    if(id == undefined || id == null || id == '') return;
    textUserIo.to(id).emit("callEnded");
  });

  socket.on("disconnect",() => {
    
    if (textChatUsers.indexOf(socket.id) > -1) {
      textChatUsers.splice(textChatUsers.indexOf(socket.id),1);
    } if(textChatUsers.indexOf(socket.id) > -1){
      textChatUsers.splice(textChatUsers.indexOf(socket.id),1);
    } if(wantToTextChat.indexOf(socket.id) > -1){
      wantToTextChat.splice(wantToTextChat.indexOf(socket.id),1);
    }
  });

  socket.on('message', (data) => {
    socket.to(data.to).emit('message', data);
  });
});

const port = 5000;

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

app.get("/",(req,res) => {
  res.send("hello world server is running ");
})
