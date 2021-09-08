public with sharing class TodoListController {

@AuraEnabled(cacheable=true)
public static List<Todo__c> getTodoList() { 
return [SELECT   Name, Description__c, Deadline_date__c, Priority__c, Status__c
        FROM Todo__c
        ORDER BY Priority__c];
}
@AuraEnabled( cacheable = true )  
    public static List< Todo__c> fetchTodos( String searchKey ) {  
      
        String strKey = '%' + searchKey + '%';  
        return [SELECT   Name, Description__c, Deadline_date__c, Priority__c, Status__c
        FROM Todo__c WHERE Name LIKE: strKey ];  
          
    }  
@AuraEnabled
    public static void deleteTodos(List<Id> todoIds){
        try {
            List<Todo__c> todoToDelete = new List<Todo__c>();
            System.debug('todoIds ====> '+todoIds);
            for(Id idTd : todoIds) {
                todoToDelete.add(new Todo__c(Id = idTd));
            }
            if(!todoToDelete.isEmpty()) {
                delete todoToDelete;
            }
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
}