function show(){

if(document.getElementById('custom-invite').checked) {
document.getElementById('custom-invite').value='true';
var ele=document.getElementsByClassName('users-invited')
for(var i =0;i<ele.length;i++){
   ele[i].checked=true;}
      console.log(document.getElementsByClassName('custom-invite'))
      document.getElementsByClassName('custom-invite')[0].style.display='none'
  } else {
        document.getElementById('custom-invite').value='f';

        document.getElementsByClassName('custom-invite')[0].style.display='unset'


  }
  }