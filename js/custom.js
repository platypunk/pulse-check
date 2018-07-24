// options
$(document).ready(function(){
    var next = 1;
    $(".add-more").click(function(e){
        e.preventDefault();
        var addto = "#option" + next;
        var addRemove = "#option" + (next);
        next = next + 1;
        var newIn = '<input autocomplete="off" class="form-control form-control-option" id="option' + next + '" name="option' + next + '" type="text" placeholder="Enter option">';
        var newInput = $(newIn);
        var removeBtn = '<button id="remove' + (next - 1) + '" class="btn remove-me" >-</button></div><div id="option">';
        var removeButton = $(removeBtn);
        $(addto).after(newInput);
        $(addRemove).after(removeButton);
        $("#option" + next).attr('data-source',$(addto).attr('data-source'));
        $("#count").val(next);  
        
        $('.remove-me').click(function(e){
            e.preventDefault();
            var optionNum = this.id.charAt(this.id.length-1);
            var optionID = "#option" + optionNum;
            $(this).remove();
            $(optionID).remove();
        });
    });
});

// datetimepicker
$(function () {
  $('#datetimepicker1').datetimepicker();
});

// questions post
$(function(){
    $('#questionSubmit').click(function(e){
      e.preventDefault();
      var $form = $('#questionForm');
      $.post(
        $form.attr("action"),
        $form.serialize(),
        function(data) { 
            console.log(data);
            if(data.success) {
                window.location.reload(true);
            } else {
                $form.append('<div class="alert alert-danger">' + data.message + '</div>');
            }
        })
  });
});
