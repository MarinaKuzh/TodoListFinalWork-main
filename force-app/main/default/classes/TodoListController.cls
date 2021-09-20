public with sharing class TodoListController {



    @AuraEnabled(cacheable=true)
    public static List<Todo__c> getTodos ( String searchKey, String sortBy, String sortDirection) {
      
       String query = 'SELECT Name, Description__c, Status__c, Priority__c, Due_Date__c, Category__c,RecordType.Name, RecordTypeId FROM Todo__c ';
       system.debug('query---'+query);
       if ( searchKey != null && searchKey != '' ) {
           String key = '%' + searchKey + '%';
           query += ' WHERE Name LIKE :key';
       }
       if ( sortBy != null && sortDirection != null ) {
           query += ' ORDER BY ' + sortBy + ' ' + sortDirection;
       }
       return Database.query( query );
   }

    @AuraEnabled
    public static void deleteTodo (List<Id> idList){
        List<Todo__c> todoList = new List<Todo__c>();
        for(Id id : idList){
            todoList.add(new Todo__c(Id = id));
        }

        if(!todoList.isEmpty()){
            delete todoList;
        }
    }
}