function show(){

if(document.getElementById('custom-invite').checked) {
var ele=document.getElementsByClassName('users-invited')
for(var i =0;i<ele.length;i++){
   ele[i].checked=true;}
      console.log(document.getElementsByClassName('custom-invite'))
      document.getElementsByClassName('custom-invite')[0].style.display='none'
  } else {
        document.getElementsByClassName('custom-invite')[0].style.display='unset'


  }
  }