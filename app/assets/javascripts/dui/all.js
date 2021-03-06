// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require dui/backbone.meta_collection
//= require dui/feedback_view
//= require dui/confirmable_view
//= require dui/pager
//= require dui/listing
//= require dui/listing_meta
//= require dui/listing_collection
//= require dui/pager_item
//= require dui/pager_item_view
//= require dui/pager_view
//= require dui/listing_view
//= require dui/enhanced_listing_view
//= require dui/loading_overlay
//= require dui/movable
//= require dui/searchable_field
//= require dui/uploader/uploader_view
//= require dui/multi_select/multi_select_view
//= require dui/multi_select/marionette_multi_select_view
//= require dui/toggler
//= require dui/crud_box_view

$(function () {
  window.feedbackView = new FeedbackView({ el: $('.feedback') })
  window.feedbackView.delayedRender()

  $('[data-toggler]').toggler()
})
