public with sharing class SubTodoListController {

    @AuraEnabled(Cacheable = true)
    public static List<Sub_Task__c> getSubTask(){
        return [SELECT Name, Description__c, Status__c FROM Sub_Task__c ORDER BY Name];
    }
  

    @AuraEnabled
        public static void deleteSubTasks (List<Id> idList){
            List<Sub_Task__c> subTaskList = new List<Sub_Task__c>();
            for(Id id : idList){
                subTaskList.add(new Sub_Task__c(Id = id));
            }
    
    
            if(!subTaskList.isEmpty()){
                delete subTaskList;
            }
        }

}
