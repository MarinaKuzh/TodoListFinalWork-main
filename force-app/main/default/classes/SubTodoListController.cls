public with sharing class SubTodoListController {

    @AuraEnabled(Cacheable = true)
    public static List<Activity> getSubTask(){
        return [SELECT Name__c, Description__c, Status__c FROM Activity ORDER BY Name limit 10];
    }
  

    @AuraEnabled
    public static void deleteSubTasks (List<Id> lstSubTaskIds){
        try {
            List<Activity> lstSubTaskToDelete = new List<Activity>();
            System.debug('lstSubTaskIds ====> '+lstSubTaskIds);
            for(Id idSubTask : lstSubTaskIds) {
                lstSubTaskToDelete.add(new Activity(Id = idSubTask));
            }
            if(!lstSubTaskToDelete.isEmpty()) {
                delete lstSubTaskToDelete;
            }
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }

}
