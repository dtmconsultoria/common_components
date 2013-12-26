describe("ListingView", function() {
  var view, listing, orderableListingWrapper,
      paginableListingWrapper, paginationContainerEl

  beforeEach(function() {
    LoadingOverlay.fadeDuration = 10

    loadFixtures('listing_view.html')

    jasmine.Clock.useMock()
    jasmine.Ajax.useMock()

    listing                 = $('.listing-wrapper')
    orderableListingWrapper = $('.listing-wrapper-ordered')
    paginableListingWrapper = $('.listing-wrapper-paginated')

    paginationContainerEl = $('.pagination-container')
  });

  describe("A ListingView with search", function() {
    it("defines the term attribute on the model after the input value changes", function() {
      var inputField = $('.search-field')

      view = new ListingView({ el: listing, searchEl: inputField })

      inputField.val('anything').trigger('keyup')
      jasmine.Clock.tick(300)

      expect(view.model.get('term')).toEqual('anything')
    })
  });

  describe("A ListingView with pagination", function() {
    describe("when the listing model is sync", function() {
      it("reconfigures the pager", function() {
        view = new ListingView({
          el: paginableListingWrapper,
          paginationContainerEl: paginationContainerEl
        })

        spyOn(view, 'reconfigurePager')

        view.model.trigger('sync', view.model, 'some data')

        expect(view.reconfigurePager).toHaveBeenCalled()
      })
    })
  })

  describe("A ListingView with ordenation", function() {
    describe("when ListingView has initial data", function() {

      it("starts model with data-initial-listing-data", function() {
        view = new ListingView({ el: orderableListingWrapper })

        expect(view.model.get('order_field')).toEqual('parameterized-name')
        expect(view.model.get('order_direction')).toEqual('desc')
      })

      it("adds order classes to order element", function() {
        view = new ListingView({ el: orderableListingWrapper })

        var orderElement = $('[data-order=parameterized-name]')

        expect(orderElement.hasClass('selected')).toBeTruthy()
        expect(orderElement.hasClass('desc')).toBeTruthy()
      })
    });

  });

  describe("when reloading", function() {
    it("sends an GET ajax request to load listing, and render the contents of the listing with the response text", function() {
      var data = '<table><tbody><tr><td>some listing data</td></tr></tbody></table>'

      view = new ListingView({ el: listing })
      view.reload()

      request = mostRecentAjaxRequest();
      request.response({status: 200, responseText: data})

      expect(request.url.split('?')[0]).toBe(listing.data('url'))
      expect(request.method).toBe('GET')

      expect(listing.html()).toBe(data)
    });

    it("displays an overlay over the listing", function() {
      view = new ListingView({ el: listing })
      view.reload()

      expect(listing.hasClass('loading-overlay')).toBeTruthy()
      expect(listing.hasClass('active-overlay')).toBeTruthy()
    });

    describe("and the ajax request is successfull", function() {
      it("hides the overlay", function() {
        view = new ListingView({ el: listing })
        view.reload()

        request = mostRecentAjaxRequest();
        request.response({status: 200, responseText: 'some data'})

        waitsFor(function () {
          return !listing.hasClass('active-overlay')
        }, 100)

        runs(function () {
          expect(listing.hasClass('active-overlay')).toBeFalsy()
        })
      });

      it("triggers a 'complete' event", function() {
        var called = false

        view = new ListingView({ el: listing })
        view.on('complete', function(){ called = true })
        view.reload()

        request = mostRecentAjaxRequest();
        request.response({status: 200, responseText: 'some data'})

        expect(called).toBeTruthy()
      });

      describe("and view has a feedbackView", function() {
        var feedbackView = new FeedbackView({el: $('.feedback')})

        it("after render sets closeFeedback variable to false", function() {
          view = new ListingView({ el: listing, feedbackView: feedbackView })
          view.closeFeedback = true

          view.reload()

          request = mostRecentAjaxRequest();
          request.response({status: 200, responseText: 'some data'})

          expect(view.closeFeedback).toEqual(false)
        })

        describe("when closeFeedback variable is false", function() {
          it("don't closes the feedback message", function() {
            view = new ListingView({ el: listing, feedbackView: feedbackView })
            view.closeFeedback = false
            spyOn(feedbackView, 'close')

            view.reload()

            request = mostRecentAjaxRequest();
            request.response({status: 200, responseText: 'some data'})

            expect(feedbackView.close).not.toHaveBeenCalled()
          })
        })

        describe("when closeFeedback variable is true", function() {
          it("closes the feedback message", function() {
            view = new ListingView({ el: listing, feedbackView: feedbackView })
            view.closeFeedback = true
            spyOn(feedbackView, 'close')

            view.reload()

            request = mostRecentAjaxRequest();
            request.response({status: 200, responseText: 'some data'})

            expect(feedbackView.close).toHaveBeenCalled()
          })
        });
      })
    });

    describe("and the ajax request returns an error", function() {
      it("hides the overlay", function() {
        view = new ListingView({ el: listing })
        view.reload()

        request = mostRecentAjaxRequest();
        request.response({status: 500, responseText: 'some error'})

        waitsFor(function () {
          return !listing.hasClass('active-overlay')
        }, 100)

        runs(function () {
          expect(listing.hasClass('active-overlay')).toBeFalsy()
        })
      });

      it("triggers a 'complete' event", function() {
        var called = false

        view = new ListingView({ el: listing })
        view.reload()

        view.on('complete', function(){ called = true })

        request = mostRecentAjaxRequest();
        request.response({status: 500, responseText: 'some error'})

        expect(called).toBeTruthy()
      });

      it("renders a feedback message", function() {
        var feedbackView = new FeedbackView({el: $('.feedback')})
        spyOn(feedbackView, 'render')

        view = new ListingView({ el: listing, feedbackView: feedbackView })
        view.reload()

        request = mostRecentAjaxRequest();
        request.response({status: 500, responseText: 'some error'})

        expect(feedbackView.render).toHaveBeenCalledWith(listing.data('error-message'), 'alert-error', true)
      });

      it("sets closeFeedback variable to close feedback message", function() {
        var feedbackView = new FeedbackView({el: $('.feedback')})
        spyOn(feedbackView, 'render')

        view = new ListingView({ el: listing, feedbackView: feedbackView })
        view.reload()

        request = mostRecentAjaxRequest();
        request.response({status: 500, responseText: 'some error'})

        expect(view.closeFeedback).toEqual(true)
      })
    });
  });
});

describe("DestroyableListingView", function() {
  var view, listing

  beforeEach(function() {
    LoadingOverlay.fadeDuration = 10
    loadFixtures('listing_view.html')
    jasmine.Ajax.useMock()

    listing = $('.listing-wrapper')
  });

  it("is a ListingView", function() {
    expect(new DestroyableListingView({el: listing})).toBeAnInstanceOf(ListingView)
  });

  it("has a ConfirmableModalView", function() {
    view = new DestroyableListingView({el: listing})
    expect(view.confirmableModalView).toBeAnInstanceOf(ConfirmableModalView)
  });

  it("has a ConfirmableView", function() {
    view = new DestroyableListingView({el: listing})
    expect(view.confirmableView).toBeAnInstanceOf(ConfirmableView)
  });

  it("has a configured with the ConfirmableModalView", function() {
    view = new DestroyableListingView({el: listing})
    expect(view.confirmableView.modal).toBeAnInstanceOf(ConfirmableModalView)
  });

  it("uses the same listing element to the ConfirmableView", function() {
    view = new DestroyableListingView({el: listing})
    expect(view.confirmableView.el).toBe(view.el)
  });

  it("reloads the list when confirmable view is confirmed", function() {
    var data = '<table><tbody><tr><td>some listing data</td></tr></tbody></table>'

    view = new DestroyableListingView({el: listing})
    view.confirmableView.trigger('confirmable:confirmed')

    request = mostRecentAjaxRequest();
    request.response({status: 200, responseText: data})

    expect(listing.html()).toBe(data)
  });

  describe("when customizing the modal", function() {
    it("passes these options to the ConfirmableModalView", function() {
      view = new DestroyableListingView({ el: listing, modalOptions: { content: 'modal-content' } })
      expect(view.confirmableModalView.options.content).toBe('modal-content')
    });
  });
});
