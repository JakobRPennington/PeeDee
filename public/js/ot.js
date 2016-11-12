var operationManager = require('./operation');
/************************************
 * Operational Transformation using SLOT
 ************************************/

module.exports = {
    /* Symmetrically transform all items in two lists against each other */
    doSLOT: function(list1, list2) {
        if (list1.length === 0 || list2.length === 0) {
            return;
        }

        for (var i = 0; i < list2.length; i++) {
            for (var j = 0; j < list1.length; j++) {
                doSIT(list2[i], list1[j]);
            }
        }
    },
    /* Symetrically transform two operations against each other */
    doSIT: function(operation1, operation2) {
        var tempOperation1 = operation1.clone();
        var tempOperation2 = operation2.clone();
        console.log(JSON.stringify(tempOperation1));

        this.doInclusionTransformation(operation1, tempOperation2);
        this.doInclusionTransformation(operation2, tempOperation1);
    },
    /* Determine the type of transformation that needs to occur */
    doInclusionTransformation: function(operation1, operation2) {
        if (operation1.getType() == operationManager.OP_INSERT && operation2.getType() == operationManager.OP_INSERT) {
            // insert:insert
            this.ITInsertInsert(operation1, operation2);
        } else if (operation1.getType() == operationManager.OP_INSERT && operation2.getType() == operationManager.OP_DELETE) {
            // insert:delete
            this.ITInsertDelete(operation1, operation2);
        } else if (operation1.getType() == operationManager.OP_INSERT && operation2.getType() == operationManager.OP_UPDATE) {
            // insert:update
            this.ITInsertUpdate(operation1, operation2);
        } else if (operation1.getType() == operationManager.OP_DELETE && operation2.getType() == operationManager.OP_INSERT) {
            // delete:insert
            this.ITDeleteInsert(operation1, operation2);
        } else if (operation1.getType() == operationManager.OP_DELETE && operation2.getType() == operationManager.OP_DELETE) {
            // delete:delete
            this.ITDeleteDelete(operation1, operation2);
        } else if (operation1.getType() == operationManager.OP_DELETE && operation2.getType() == operationManager.OP_UPDATE) {
            // delete:update
            this.ITDeleteUpdate(operation1, operation2);
        } else if (operation1.getType() == operationManager.OP_UPDATE && operation2.getType() == operationManager.OP_INSERT) {
            // update:insert
            this.ITUpdateInsert(operation1, operation2);
        } else if (operation1.getType() == operationManager.OP_UPDATE && operation2.getType() == operationManager.OP_DELETE) {
            // update:delete
            this.ITUpdateDelete(operation1, operation2);
        } else if (operation1.getType() == operationManager.OP_UPDATE && operation2.getType() == operationManager.OP_UPDATE) {
            // update:update
            this.ITUpdateUpdate(operation1, operation2);
        }
    },
    /* Perform all permutations of INSERT, DELETE and UPDATE operations */
    ITInsertInsert: function(operation1, operation2) {
        if (operation1.getOffset() > operation2.getOffset()) {
            operation1.setOffset(operation1.getOffset() + operation2.getLength());
        } else if ((operation1.getOffset() == operation2.getOffset()) && operation1.getClientId() > operation2.getClientId()) {
            operation1.setOffset(operation1.getOffset() + operation2.getLength());
        } else return;
    },
    ITInsertDelete: function(operation1, operation2) {
        if (operation2.getLength() == 0 || operation1.getOffset() <= operation2.getOffset()) {
            return;
        } else if (operation1.getOffset() > (operation2.getOffset() + operation2.getLength())) {
            operation1.setOffset(operation1.getOffset() - operation2.getLength());
        } else if (operation1.getOffset() == (operation2.getOffset() + operation2.getLength())) {
            operation1.setOffset(operation2.getOffset());
        } else {
            operation1.setOffset(operation2.getOffset());
            operation1.setLength(0);
            operation1.setText("");
        }
    },
    ITInsertUpdate: function(operation1, operation2) {
        return;
    },
    ITDeleteInsert: function(operation1, operation2) {
        if (operation2.getOffset() >= (operation1.getOffset() + operation1.getLength())) {
            return;
        } else if (operation1.getOffset() >= operation2.getOffset()) {
            operation1.setOffset(operation1.getOffset() + operation2.getLength());
        } else {
            operation1.setLength(operation1.getLength() + operation2.getLength());
        }
    },
    ITDeleteDelete: function(operation1, operation2) {
        if (operation2.getLength() == 0 || operation2.getOffset() >= (operation1.getOffset() + operation1.getLength())) {
            // Operation1 ---------- || ----------
            // Operation2            ||             ----------
            return;
        } else if (operation1.getOffset() >= (operation2.getOffset() + operation2.getLength())) {
            // Operation1         ---------- 
            // Operation2 ------          
            operation1.setOffset(operation1.getOffset() - operation2.getLength());
        } else if ((operation2.getOffset() <= operation1.getOffset()) && (operation1.getOffset() + operation1.getLength() <= operation2.getOffset() + operation2.getLength())) {
            // Operation1    ---------- 
            // Operation2 ---------------         
            operation1.setLength(0);
        } else if (operation2.getOffset() <= operation1.getOffset() && operation1.getOffset() + operation1.getLength() > operation2.getOffset() + operation2.getLength()) {
            // Operation1      -----------
            // Operation2 ----------
            var tempOffset = operation1.getOffset();
            operation1.setOffset(operation2.getOffset());
            operation1.setLength((tempOffset + operation1.getLength()) - (operation2.getOffset() + operation2.getLength()))
        } else if (operation2.getOffset() > operation1.getOffset() && operation2.getOffset() + operation2.getLength() >= operation1.getOffset() + operation1.getLength()) {
            // Operation1 --------
            // Operation2    --------
            operation1.setLength(operation2.getOffset() - operation1.getOffset());
        } else if (operation2.getOffset() > operation1.getOffset() && operation2.getOffset() + operation2.getLength() > operation1.getOffset() + operation1.getLength()) {
            // Operation 1 -------------
            // Operation2     ------
            operation1.setLength(operation1.getLength() - operation2.getLength())
        } else {
            return;
        }
    },
    ITDeleteUpdate: function(operation1, operation2) {
        return;
    },
    ITUpdateInsert: function(operation1, operation2) {
        if (op2.getOffset() >= operation1.getOffset() + operation1.getLength()) {
            return;
        } else if (operation1.getOffset() >= operation2.getOffset()) {
            operation1.setOffset(operation1.getOffset() + operation2.getLength());
        } else {
            operation1.setLength(operation1.getLength() + operation2.getLength());
        }
    },
    ITUpdateDelete: function(operation1, operation2) {
        if (operation2.getLength() == 0 || operation2.getOffset() >= (operation1.getOffset() + operation1.getLength())) {
            // Operation1 ---------- || ----------
            // Operation2            ||             ----------
            return;
        } else if (operation1.getOffset() >= (operation2.getOffset() + operation2.getLength())) {
            // Operation1         ---------- 
            // Operation2 ------          
            operation1.setOffset(operation1.getOffset() - operation2.getLength());
        } else if ((operation2.getOffset() <= operation1.getOffset()) && (operation1.getOffset() + operation1.getLength() <= operation2.getOffset() + operation2.getLength())) {
            // Operation1    ---------- 
            // Operation2 ---------------         
            operation1.setLength(0);
        } else if (operation2.getOffset() <= operation1.getOffset() && operation1.getOffset() + operation1.getLength() > operation2.getOffset() + operation2.getLength()) {
            // Operation1      -----------
            // Operation2 ----------
            var tempOffset = operation1.getOffset();
            operation1.setOffset(operation2.getOffset());
            operation1.setLength((tempOffset + operation1.getLength()) - (operation2.getOffset() + operation2.getLength()))
        } else if (operation2.getOffset() > operation1.getOffset() && operation2.getOffset() + operation2.getLength() >= operation1.getOffset() + operation1.getLength()) {
            // Operation1 --------
            // Operation2    --------
            operation1.setLength(operation2.getOffset() - operation1.getOffset());
        } else if (operation2.getOffset() > operation1.getOffset() && operation2.getOffset() + operation2.getLength() > operation1.getOffset() + operation1.getLength()) {
            // Operation 1 -------------
            // Operation2     ------
            operation1.setLength(operation1.getLength() - operation2.getLength())
        } else {
            return;
        }
    },
    ITUpdateUpdate: function(operation1, operation2) {
        if (operation1.getKey() != operation2.getKey()) {
            return;
        } else if (operation2.getLength() == 0 || operation2.getOffset() >= operation1.getOffset() + operation1.getLength() || operation1.getOffset() >= (operation2.getOffset() + operation2.getLength())) {
            // Operation1 ---------- || ----------              ||            ----------
            // Operation2            ||             ----------  || ---------
            return;
        } else if ((operation2.getOffset() <= operation1.getOffset()) && (operation1.getOffset() + operation1.getLength() <= operation2.getOffset() + operation2.getLength())) {
            // Operation1    ---------- 
            // Operation2 --------------- 
            operation1.setLength(0);
        } else if (operation2.getOffset() <= operation1.getOffset() && operation1.getOffset() + operation1.getLength() > operation2.getOffset() + operation2.getLength()) {
            // Operation1      -----------
            // Operation2 ----------
            if (operation1.getClientId() > operation2.getClientId()) {
                operation1.setOffset(operation2.getOffset() + operation2.getLength());
                operation1.setLength(operation1.getOffset() + operation1.getLength() - (operation2.getOffset() + operation2.getLength()));
            } else {
                return;
            }
        } else if (operation2.getOffset() > operation1.getOffset() && operation2.getOffset() + operation2.getLength() >= operation1.getOffset() + operation1.getLength()) {
            // Operation1 --------
            // Operation2    --------
            if (operation1.getClientId() > operation2.getClientId()) {
                operation1.setLength(operation2.getOffset - operation1.getOffset());
            } else {
                return;
            }
        } else if (operation2.getOffset() > operation1.getOffset() && operation2.getOffset() + operation2.getLength() > operation1.getOffset() + operation1.getLength()) {
            // Operation 1 -------------
            // Operation2     ------
            return;
        } else {
            return;
        }
    },
}