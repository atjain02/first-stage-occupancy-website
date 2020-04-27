  //calculates occupancy time remaining, and displays it, and updates status if occupancy is done
  function remainingTime (statusDisplay)
  {
    var currentDate = new Date();
    var currentTime = currentDate.getTime();

    var inputTime =  getValue(statusDisplay.id,"inputTime");
    var occupyTime = getValue(statusDisplay.id,"time");

    var msOccupyTime = occupyTime*60000;
    var diff = currentTime - inputTime;

    if(diff >= msOccupyTime)
    {
      updateText(statusDisplay.id + "-button");
    }
    else 
    {
      var timeRemaining = document.createElement("p");
      var timeText = document.createTextNode(Math.round((msOccupyTime-diff)/60000) + " minutes remaining");
      var div = document.getElementById(statusDisplay.id + "-div");
      timeRemaining.id=statusDisplay.id + "-p";

      timeRemaining.appendChild(timeText);
      div.appendChild(timeRemaining);
      div.style.color="red";
    }
  }
  
  //function that converts database 0,1 value into roomStatus as a string 
  function roomStatus (rawStatus)
  {
    if (rawStatus == 0)
      return "Currently Vacant";
    else 
      return "Currently Occupied";
  }
  
  //function that converts database 0,1 value into buttonText as a string
  function buttonText (rawStatus)
  {
    if (rawStatus == 0)
      return "Occupy this room!";
    else 
      return "Vacate this room!";
  }
  
  //function switches numbers (used to change numbers for database, everytime a button is hit)
  function change (num)
  {
    if (num == 0)
      return 1;
    else
      return 0;
  }

  //function checks if a particular form exists
  function checkFormExist(room)
  {
   if(document.body.contains(document.getElementById("timeForm-" + room)))
    return true;
   else
    return false;
  }
  
  //changes room status to opposite whatever it is right now
  function updateText(buttonID)
  {
    //getting roomID after slicing button ID (button ID must always be "room" + "-" + "buttonID"
    var pos = buttonID.indexOf("-");
    var room = buttonID.slice(0,pos);
  
      var statusVar = getValue(room,"status")
      var changedStatusVar = change(statusVar);//status changed to what the new one will be
      var roomStatusVar = roomStatus(changedStatusVar);
      var buttonTextVar = buttonText(changedStatusVar);
  
      
      //if the roomStatus is being changed to occupied (1), then form is created
      var timeInput = -1;
      if(changedStatusVar==1)
      {
        if(checkFormExist(room) == false)
        {
          
          var form = document.createElement("form");
          form.id="timeForm-" + room;
          form.name="form-" + room;

          var br = document.createElement("BR");
          var label = document.createElement("label");
          label.style.color="#FFFFFF";
          var labelText = document.createTextNode("Time that you are going to be in the room for (in minutes): ")
          var div = document.getElementById(room + "-div");
          var input1= document.createElement("input");
          input1.name="inputText";
          input1.type="number";
          input1.min="15";
          input1.max="90";

          var inputSubmit = document.createElement("button");
          inputSubmit.type="submit";
          var submitText = document.createTextNode("Submit!");
            
          inputSubmit.id="submitButton";
                  
          form.appendChild(br);
          inputSubmit.appendChild(submitText);
          label.appendChild(labelText);
          form.appendChild(label);
          form.appendChild(input1);
          form.appendChild(inputSubmit);
          div.appendChild(form);

          //when form submitted
          form.addEventListener('submit', function(e)
          {
            e.preventDefault(); //prevents refresh
            var inputDate = new Date();

            timeInput = form.inputText.value;

            //if form is submitted with no value
            if(timeInput == "")
            {
              alert("Type in a valid number of minutes");
            }
            else
            {
              document.getElementById(room).innerHTML=roomStatusVar;//roomStatus on website updated
      
              document.getElementById(buttonID).innerHTML=buttonTextVar;//buttonText on website updated
                
              //database updated for new values
              db.collection("rooms").doc("roomsDoc").update({
              [room + "-status"]: changedStatusVar
              ,[room + "-time"]: timeInput
              ,[room + "-inputTime"]: inputDate.getTime() //this is the start time for when the room occupancy started
              }).then(function()
              {
                
                //changes text color to red
                document.getElementById(room).style.color="red";
                
                //global doc updated
                getDoc().then(function(doc)
                {
                  theDoc = doc;

                  //form removed
                  form.parentNode.removeChild(form);

                  //sets remaining time 
                  remainingTime(document.getElementById(room));

                });
              });
            }
          })
        }
        else //if the form already exists
        {
          alert("Enter the number of minutes that the room is going to be occupied for!");
        }
        }
      else //if the room is being made vacant (a form does not need to be created)
      {
        document.getElementById(room).innerHTML=roomStatusVar;//roomStatus on website updated
  
        document.getElementById(buttonID).innerHTML=buttonTextVar;//buttonText on website updated
        
        //database updated for new values
        db.collection("rooms").doc("roomsDoc").update({
          [room + "-status"]: changedStatusVar
        })

        //global doc updated
        getDoc().then(function(doc)
        {
          theDoc = doc;
          //remove remaining time message
          document.getElementById(room + "-p").parentNode.removeChild(document.getElementById(room + "-p"));
            
          //change color to green
          document.getElementById(room).style.color="green";
        });
      }
    
  }//end updateText


  //doc is "read" from database, and its global value is updated
  function getDoc()
  {
    return db.collection("rooms").doc("roomsDoc").get().then(function(doc) {
      console.log("a read is being done");
      return doc;
    });
  }

  //pulls the value of a field from doc
  function getValue(room,toGet)
  {
    var field = room + "-" + toGet;
    const data = theDoc.data();
    return data[field];
  }

