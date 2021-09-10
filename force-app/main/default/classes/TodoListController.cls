public with sharing class TodoListController {

    @AuraEnabled(Cacheable = true)
    public static List<Todo__c> getTodoList(){
        return [SELECT Name, Description__c, Status__c, Priority__c, Deadline_date__c FROM Todo__c ORDER BY Name limit 10];
    }

    @AuraEnabled( cacheable = true )  
    public static List< Todo__c> fetchTodos( String searchKey ) {  
      
        String strKey = '%' + searchKey + '%';  
        List<Todo__c> todoListRecord = new List<Todo__c>();
        for(Todo__c todoObj : [SELECT   Name, Description__c, Deadline_date__c, Priority__c, Status__c
        FROM Todo__c WHERE Name LIKE: strKey ]){
           todoListRecord.add(todoObj);
        }
        
         if(todoListRecord.size()==null){
            throw new AuraHandledException('No Record Found..'); 
         }
         
        return todoListRecord;
          
    }  


    @AuraEnabled
    public static void deleteTodos (List<Id> lstTodoIds){
        try {
            List<Todo__c> lstTodoToDelete = new List<Todo__c>();
            System.debug('lstTodoIds ====> '+lstTodoIds);
            for(Id idTodo : lstTodoIds) {
                lstTodoToDelete.add(new Todo__c(Id = idTodo));
            }
            if(!lstTodoToDelete.isEmpty()) {
                delete lstTodoToDelete;
            }
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
}