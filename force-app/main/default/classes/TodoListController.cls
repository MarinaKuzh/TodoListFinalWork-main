public with sharing class TodoListController {

    @AuraEnabled(Cacheable = true)
    public static List<Task> getTasks(){
        return [SELECT Subject, Description, Status, Priority, Due_date FROM Task ORDER BY Subject limit 10];
    }

    @AuraEnabled( cacheable = true )  
    public static List< Task> fetchTasks( String searchKey ) {  
      
        String strKey = '%' + searchKey + '%';  
        List<Task> taskListRecord = new List<Task>();
        for(Task taskObj : [SELECT   Subject, Description, Due_date, Priority, Status
        FROM Task WHERE Subject LIKE: strKey ]){
           taskListRecord.add(taskObj);
        }
        
         if(taskListRecord.size()==null){
            throw new AuraHandledException('No Record Found..'); 
         }
         
        return taskListRecord;
          
    }  


    @AuraEnabled
    public static void deleteTasks (List<Id> lstTaskIds){
        try {
            List<Task> lstTaskToDelete = new List<Task>();
            System.debug('lstTaskIds ====> '+lstTaskIds);
            for(Id idTask : lstTaskIds) {
                lstTaskToDelete.add(new Task(Id = idTask));
            }
            if(!lstTaskToDelete.isEmpty()) {
                delete lstTaskToDelete;
            }
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
}