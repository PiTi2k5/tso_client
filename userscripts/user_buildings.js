//
// addMenuItem from main script
addToolsMenuItem(Buildings_Translate("Buildings"), IsleBuildingsMenuHandler);
//
// Build the dialog
function IsleBuildingsMenuHandler(event)
{     
   //
   // Global variables
   BuildingData = new Array();
   BuildingItemData = new Array();
   GameInterface = swmmo.application.mGameInterface;   
   // close all modals
   $( "div[role='dialog']:not(#buildingsModal):visible").modal("hide");
   //
   Buildings_LoadData();
   //
   // create modal
   createModalWindow('buildingsModal', Buildings_Translate("Buildings") + ' (by Redz Italian server)');
   //
   $('#buildingsModalData').html(Buildings_LoadDialog());
   //
   Buildings_AddEvents();
   //
   // show modal
   $('#buildingsModal:not(:visible)').modal({backdrop: "static"});
}

function Buildings_LoadData()
{
   var buildings = GameInterface.mCurrentPlayerZone.mStreetDataMap.GetBuildings_vector();

   buildings.forEach(function(item)
   {
      if(item !== null)
      {
         //Buildings_Log(item);
         var gridPosition = item.GetGrid();
         var iconMap = "";
         
         if(gridPosition > 0)
         {
            iconMap = getImageTag("accuracy.png", '24px', '24px').replace('<img','<img id="buildingPOS_' + gridPosition + '"').replace('style="', 'style="cursor: pointer;');

            BuildingData.push({ "Name" : Buildings_Translate(item.GetBuildingName_string()),	
                                "IconMap" : iconMap,
                                "Level": item.GetUpgradeLevel(),
                                "GridPosition": gridPosition });    
         }                 
      }
   });

   BuildingData.sort(Buildings_Sort);

   BuildingItemData.length = 0; // Reset items
   BuildingItemData.push({ "Name" : "", "Level": "", Count: 0 });

   BuildingData.forEach(function(item)
   {
      var found = false;
      for(var i = 0; i < BuildingItemData.length; i++) 
      {
         if (BuildingItemData[i].Name === item.Name && BuildingItemData[i].Level === item.Level) 
         {
            found = true;
            BuildingItemData[i].Count += 1;
            break;
         }            
      }

      if(! found )
      {
         BuildingItemData.push({"Name" : item.Name, "Level": item.Level, "Count": 1 });
      }
   });
}

function Buildings_LoadDialog()
{
   var out = '<div class="container-fluid">';
   try
   {
      out += '<div id="BuildingsSelect">';
      //
      // Create the list of buildings
      var buildType = '<select id="BuilderType" style="width: 98%;">';
      
      BuildingItemData.forEach(function(item) 
      {
         if(item.Count > 0)
         {
            buildType += '<option value="' + item.Name + '|' + item.Level + '">' + item.Name + ' - ' + Buildings_Translate("Level") + item.Level + ', ' + Buildings_Translate("Total: ") + item.Count + '</option>';
         }
         else
         {
            buildType += '<option value="' + item.Name + '|' + item.Level + '"></option>';
         }
      });      
      buildType += '</select>';
      
      out += '<span>' + Buildings_Translate("Buildings") + ': </span><br/>' 
      out += buildType + '</div>';
   }
   catch(error)
   {
      alert(error);
   }    
   
   out += '<br/><div id="BuildingsFound"></div>';
   return out + '</div>';
} 

function Buildings_AddEvents()
{
   $("#BuilderType").prop("selectedIndex", 0);
   $('#BuilderType').change(function() {Buildings_ChangeBuildType(this.value);});	   
}

function Buildings_ChangeBuildType(value)
{
   $('#BuildingsFound').html("");
   
   if(isDebug)
   {
      $('#BuildingsFound').append(createTableRow([[1, "Id"], [9, loca.GetText("LAB", "Name")],[1, loca.GetText("LAB", "Level")], [1, loca.GetText("LAB", "Visit")]], true));
   }
   else
   {
      $('#BuildingsFound').append(createTableRow([[10, loca.GetText("LAB", "Name")],[1, loca.GetText("LAB", "Level")], [1, loca.GetText("LAB", "Visit")]], true));
   }
   $('#BuildingsFound').append("<br/>");
   
   var v = value.split("|");

   BuildingData.forEach(function(item)
   {
      if((item.Name === v[0]) && (item.Level.toString() === v[1]))
      {
         if(isDebug)
         {
            $('#BuildingsFound').append('<div style="color: yellow;">' +createTableRow([[1, item.GridPosition], [9, item.Name], [1, item.Level], [1, item.IconMap]], false) +'</div>');		
         }
         else
         {
            $('#BuildingsFound').append('<div style="color: yellow;">' +createTableRow([[10, item.Name], [1, item.Level], [1, item.IconMap]], false) +'</div>');		
         }
         if (item.IconMap != "")			
         {
            document.getElementById("buildingPOS_" + item.GridPosition).addEventListener("click", function() {Buildings_GoTo(item.GridPosition);});
         }
      }
   });   
}
//
// Utilities
function Buildings_Sort(a, b)
{
   try
   {
      if (a.Name < b.Name) return -1;
      if (a.Name > b.Name) return 1;
      
      if (a.Level > b.Level) return 1;
      if (a.Level < b.Level) return -1;
   }
   catch (e) 
   {
   }
   return 0;
}

function Buildings_GoTo(g)
{
   try
   {
      $('#buildingsModal').modal('hide');
      GameInterface.mCurrentPlayerZone.ScrollToGrid(g);
   }
   catch (e) 
   {
      Buildings_Log('Buildings_GoTo: Error [' + e + '], gridPosition [' + g + ']');
   }
}

function Buildings_Translate(name)
{
   var TypeID = ["BUI", "LAB", "TOT", "SPE", "RES", "ALM", "SHI", "SD3", "ACL", "SHG", "MEL", "ADN", "HIL"];
   var nameTranslated = "";
   
   for(i = 0; i < TypeID.length; i++)
   {
      nameTranslated = Buildings_InnerTranslate(TypeID[i], name);
      if(nameTranslated !== "")
      {
         break;
      }
   }

   // If the name is not translated, return the original value
   if(nameTranslated == "")
   {
      nameTranslated = name;
   }   
  
   return nameTranslated;
}

function Buildings_InnerTranslate(id, name)
{
   var nameTranslated = "";
   try
   {
      nameTranslated = loca.GetText(id, name);
   }
   catch(err)
   {
      Buildings_Log('Buildings_InnerTranslate: Error [' + err + '], Id [' + id + '], name [' + name + ']');
   }
   
   if(nameTranslated == '[undefined text] ')
   {
      nameTranslated = "";
   }
   return nameTranslated;
}

function Buildings_Log(obj)
{
   if(isDebug)
   {
      debug(obj);
   }
}

