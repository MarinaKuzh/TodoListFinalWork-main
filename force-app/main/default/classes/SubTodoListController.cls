public with sharing class SubTodoListController {

    @AuraEnabled(Cacheable = true)
    public static List<Sub_Todo__c> getSubTodoList(){
        return [SELECT Name, Description__c, Status__c FROM Sub_Todo__c ORDER BY Name limit 10];
    }

    @AuraEnabled( cacheable = true )  
    public static List< Sub_Todo__c> fetchSubTodos( String searchKey ) {  
      
        String strKey = '%' + searchKey + '%';  
        List<Sub_Todo__c> subTodoListRecord = new List<Sub_Todo__c>();
        for(Sub_Todo__c subTodoObj : [SELECT   Name, Description__c,Status__c
        FROM Sub_Todo__c WHERE Name LIKE: strKey ]){
           subTodoListRecord.add(subTodoObj);
        }
        
         if(subTodoListRecord.size()==null){
            throw new AuraHandledException('No Record Found..'); 
         }
         
        return subTodoListRecord;
          
    }  

    @AuraEnabled
    public static void deleteSubTodos (List<Id> lstSubTodoIds){
        try {
            List<Sub_Todo__c> lstSubTodoToDelete = new List<Sub_Todo__c>();
            System.debug('lstSubTodoIds ====> '+lstSubTodoIds);
            for(Id idSubTodo : lstSubTodoIds) {
                lstSubTodoToDelete.add(new Sub_Todo__c(Id = idSubTodo));
            }
            if(!lstSubTodoToDelete.isEmpty()) {
                delete lstSubTodoToDelete;
            }
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }

}
