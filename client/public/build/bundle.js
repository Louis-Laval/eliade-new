
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(html, anchor = null) {
            this.e = element('div');
            this.a = anchor;
            this.u(html);
        }
        m(target, anchor = null) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(target, this.n[i], anchor);
            }
            this.t = target;
        }
        u(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        p(html) {
            this.d();
            this.u(html);
            this.m(this.t, this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src\Components\Common\Navbar.svelte generated by Svelte v3.16.7 */

    const file = "src\\Components\\Common\\Navbar.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (53:8) {#each navlists as list}
    function create_each_block(ctx) {
    	let li;
    	let a;
    	let t0_value = /*list*/ ctx[1].label + "";
    	let t0;
    	let a_href_value;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "class", "nav-link svelte-6xuiyl");
    			attr_dev(a, "href", a_href_value = /*list*/ ctx[1].url);
    			add_location(a, file, 54, 12, 1558);
    			attr_dev(li, "class", "nav-item");
    			add_location(li, file, 53, 10, 1522);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navlists*/ 1 && t0_value !== (t0_value = /*list*/ ctx[1].label + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*navlists*/ 1 && a_href_value !== (a_href_value = /*list*/ ctx[1].url)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(53:8) {#each navlists as list}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let section;
    	let nav;
    	let a;
    	let img;
    	let img_src_value;
    	let t0;
    	let button;
    	let span;
    	let t1;
    	let div;
    	let ul;
    	let each_value = /*navlists*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			nav = element("nav");
    			a = element("a");
    			img = element("img");
    			t0 = space();
    			button = element("button");
    			span = element("span");
    			t1 = space();
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (img.src !== (img_src_value = "images/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo Eliade");
    			set_style(img, "width", "100%");
    			add_location(img, file, 38, 6, 1017);
    			attr_dev(a, "class", "navbar-brand company_brand");
    			attr_dev(a, "href", "/#");
    			add_location(a, file, 37, 4, 961);
    			attr_dev(span, "class", "navbar-toggler-icon");
    			add_location(span, file, 48, 6, 1327);
    			attr_dev(button, "class", "navbar-toggler");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-toggle", "collapse");
    			attr_dev(button, "data-target", "#navbarNav");
    			attr_dev(button, "aria-controls", "navbarNav");
    			attr_dev(button, "aria-expanded", "false");
    			attr_dev(button, "aria-label", "Toggle navigation");
    			add_location(button, file, 40, 4, 1098);
    			attr_dev(ul, "class", "navbar-nav ml-auto svelte-6xuiyl");
    			add_location(ul, file, 51, 6, 1445);
    			attr_dev(div, "class", "collapse navbar-collapse");
    			attr_dev(div, "id", "navbarNav");
    			add_location(div, file, 50, 4, 1384);
    			attr_dev(nav, "class", "navbar navbar-expand-md svelte-6xuiyl");
    			attr_dev(nav, "id", "nav");
    			add_location(nav, file, 36, 2, 909);
    			attr_dev(section, "id", "nav-bar");
    			attr_dev(section, "class", "svelte-6xuiyl");
    			add_location(section, file, 35, 0, 883);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, nav);
    			append_dev(nav, a);
    			append_dev(a, img);
    			append_dev(nav, t0);
    			append_dev(nav, button);
    			append_dev(button, span);
    			append_dev(nav, t1);
    			append_dev(nav, div);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*navlists*/ 1) {
    				each_value = /*navlists*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const scrollOrigin = 0;

    function scrollNavbar() {
    	let nav = document.getElementById("nav");
    	
    	nav.classList.add("navbar-scrolled");
    	nav.classList.remove("navbar");
    }

    function resetNavbar() {
    	var nav = document.getElementById("nav");
    	nav.classList.remove("navbar-scrolled");
    	nav.classList.add("navbar");
    }

    function instance($$self, $$props, $$invalidate) {
    	let { navlists = [] } = $$props;

    	window.addEventListener("scroll", function (e) {
    		if (window.scrollY > scrollOrigin) {
    			window.requestAnimationFrame(function () {
    				scrollNavbar();
    			});
    		}

    		if (window.scrollY === scrollOrigin) {
    			window.requestAnimationFrame(function () {
    				resetNavbar();
    			});
    		}
    	});

    	const writable_props = ["navlists"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("navlists" in $$props) $$invalidate(0, navlists = $$props.navlists);
    	};

    	$$self.$capture_state = () => {
    		return { navlists };
    	};

    	$$self.$inject_state = $$props => {
    		if ("navlists" in $$props) $$invalidate(0, navlists = $$props.navlists);
    	};

    	return [navlists];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { navlists: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get navlists() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set navlists(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Common\Footer.svelte generated by Svelte v3.16.7 */

    const file$1 = "src\\Components\\Common\\Footer.svelte";

    function create_fragment$1(ctx) {
    	let section;
    	let div5;
    	let div4;
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let p0;
    	let t3;
    	let div2;
    	let p1;
    	let t5;
    	let p2;
    	let i0;
    	let t6;
    	let html_tag;
    	let t7;
    	let p3;
    	let i1;
    	let t8;
    	let t9;
    	let t10;
    	let p4;
    	let i2;
    	let t11;
    	let t12;
    	let t13;
    	let div3;
    	let p5;
    	let t15;
    	let input;
    	let t16;
    	let button;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div5 = element("div");
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(/*header*/ ctx[0]);
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = `${/*description*/ ctx[1]}`;
    			t3 = space();
    			div2 = element("div");
    			p1 = element("p");
    			p1.textContent = `${/*title*/ ctx[4]}`;
    			t5 = space();
    			p2 = element("p");
    			i0 = element("i");
    			t6 = space();
    			t7 = space();
    			p3 = element("p");
    			i1 = element("i");
    			t8 = space();
    			t9 = text(/*mobile*/ ctx[6]);
    			t10 = space();
    			p4 = element("p");
    			i2 = element("i");
    			t11 = space();
    			t12 = text(/*email*/ ctx[7]);
    			t13 = space();
    			div3 = element("div");
    			p5 = element("p");
    			p5.textContent = `${/*subscribeNewsletter*/ ctx[2]}`;
    			t15 = space();
    			input = element("input");
    			t16 = space();
    			button = element("button");
    			button.textContent = `${/*subscribe*/ ctx[3]}`;
    			attr_dev(div0, "class", "company_brand");
    			add_location(div0, file$1, 19, 8, 556);
    			add_location(p0, file$1, 20, 8, 607);
    			attr_dev(div1, "class", "col-md-4 footer-box");
    			add_location(div1, file$1, 18, 6, 513);
    			attr_dev(p1, "class", "footer-title svelte-12t460u");
    			add_location(p1, file$1, 23, 8, 692);
    			attr_dev(i0, "class", "fas fa-map-marker-alt");
    			add_location(i0, file$1, 25, 10, 752);
    			html_tag = new HtmlTag(/*address*/ ctx[5], null);
    			add_location(p2, file$1, 24, 8, 737);
    			attr_dev(i1, "class", "fas fa-phone");
    			add_location(i1, file$1, 29, 10, 853);
    			add_location(p3, file$1, 28, 8, 838);
    			attr_dev(i2, "class", "fas fa-envelope");
    			add_location(i2, file$1, 33, 10, 938);
    			add_location(p4, file$1, 32, 8, 923);
    			attr_dev(div2, "class", "col-md-4 footer-box");
    			add_location(div2, file$1, 22, 6, 649);
    			attr_dev(p5, "class", "footer-title svelte-12t460u");
    			add_location(p5, file$1, 38, 8, 1065);
    			attr_dev(input, "type", "email");
    			attr_dev(input, "class", "form-control round-border svelte-12t460u");
    			attr_dev(input, "placeholder", "Votre adresse email");
    			add_location(input, file$1, 39, 8, 1124);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary round-border svelte-12t460u");
    			add_location(button, file$1, 43, 8, 1257);
    			attr_dev(div3, "class", "col-md-4 footer-box svelte-12t460u");
    			add_location(div3, file$1, 37, 6, 1022);
    			attr_dev(div4, "class", "row section-body");
    			add_location(div4, file$1, 17, 4, 475);
    			attr_dev(div5, "class", "container");
    			add_location(div5, file$1, 16, 2, 446);
    			attr_dev(section, "class", "main-bgcolor");
    			attr_dev(section, "id", "contacts");
    			add_location(section, file$1, 15, 0, 398);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, p0);
    			append_dev(div4, t3);
    			append_dev(div4, div2);
    			append_dev(div2, p1);
    			append_dev(div2, t5);
    			append_dev(div2, p2);
    			append_dev(p2, i0);
    			append_dev(p2, t6);
    			html_tag.m(p2);
    			append_dev(div2, t7);
    			append_dev(div2, p3);
    			append_dev(p3, i1);
    			append_dev(p3, t8);
    			append_dev(p3, t9);
    			append_dev(div2, t10);
    			append_dev(div2, p4);
    			append_dev(p4, i2);
    			append_dev(p4, t11);
    			append_dev(p4, t12);
    			append_dev(div4, t13);
    			append_dev(div4, div3);
    			append_dev(div3, p5);
    			append_dev(div3, t15);
    			append_dev(div3, input);
    			append_dev(div3, t16);
    			append_dev(div3, button);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*header*/ 1) set_data_dev(t0, /*header*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { footerData = {} } = $$props;
    	let { header = "" } = $$props;
    	const { description, contactDetails, subscribeNewsletter, subscribe } = footerData;
    	const { title, address, mobile, email } = contactDetails;
    	const writable_props = ["footerData", "header"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("footerData" in $$props) $$invalidate(8, footerData = $$props.footerData);
    		if ("header" in $$props) $$invalidate(0, header = $$props.header);
    	};

    	$$self.$capture_state = () => {
    		return { footerData, header };
    	};

    	$$self.$inject_state = $$props => {
    		if ("footerData" in $$props) $$invalidate(8, footerData = $$props.footerData);
    		if ("header" in $$props) $$invalidate(0, header = $$props.header);
    	};

    	return [
    		header,
    		description,
    		subscribeNewsletter,
    		subscribe,
    		title,
    		address,
    		mobile,
    		email,
    		footerData
    	];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { footerData: 8, header: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get footerData() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set footerData(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get header() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set header(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Home\Banner\Banner.svelte generated by Svelte v3.16.7 */

    const file$2 = "src\\Components\\Home\\Banner\\Banner.svelte";

    function create_fragment$2(ctx) {
    	let section;
    	let div13;
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let b0;
    	let t1;
    	let br0;
    	let t2;
    	let br1;
    	let t3;
    	let br2;
    	let t4;
    	let t5;
    	let div5;
    	let div3;
    	let t6;
    	let div4;
    	let b1;
    	let t8;
    	let div12;
    	let div8;
    	let div6;
    	let t9;
    	let div7;
    	let t11;
    	let div11;
    	let div9;
    	let t12;
    	let div10;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div13 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			b0 = element("b");
    			t1 = text("Petit-déjeuner SÉCURITÉ");
    			br0 = element("br");
    			t2 = text("10/03/2020");
    			br1 = element("br");
    			t3 = text("8h15 - 10h30");
    			br2 = element("br");
    			t4 = text("Ensemble, démarrons la journée du MARDI 10 MARS 2020 de 8h15 à 10h30 sur la thématique de la SÉCURITÉ");
    			t5 = space();
    			div5 = element("div");
    			div3 = element("div");
    			t6 = space();
    			div4 = element("div");
    			b1 = element("b");
    			b1.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
    			t8 = space();
    			div12 = element("div");
    			div8 = element("div");
    			div6 = element("div");
    			t9 = space();
    			div7 = element("div");
    			div7.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
    			t11 = space();
    			div11 = element("div");
    			div9 = element("div");
    			t12 = space();
    			div10 = element("div");
    			div10.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
    			attr_dev(div0, "class", "image svelte-ap6212");
    			set_style(div0, "background-image", "url('images/ptit-dej.png')");
    			add_location(div0, file$2, 10, 6, 370);
    			add_location(br0, file$2, 13, 34, 540);
    			add_location(br1, file$2, 13, 48, 554);
    			add_location(b0, file$2, 13, 8, 514);
    			add_location(br2, file$2, 13, 68, 574);
    			attr_dev(div1, "class", "white-thumbnail right-align svelte-ap6212");
    			add_location(div1, file$2, 12, 6, 463);
    			attr_dev(div2, "class", "blog w40 svelte-ap6212");
    			add_location(div2, file$2, 9, 4, 340);
    			attr_dev(div3, "class", "image svelte-ap6212");
    			set_style(div3, "background-image", "url('images/team-hands-linked-together.jpg')");
    			add_location(div3, file$2, 18, 6, 743);
    			add_location(b1, file$2, 21, 8, 899);
    			attr_dev(div4, "class", "transparent-thumbnail svelte-ap6212");
    			add_location(div4, file$2, 20, 6, 854);
    			attr_dev(div5, "class", "blog w30 svelte-ap6212");
    			add_location(div5, file$2, 17, 4, 713);
    			attr_dev(div6, "class", "image svelte-ap6212");
    			set_style(div6, "background-image", "url('images/business-team-meeting-boardroom.jpg')");
    			add_location(div6, file$2, 27, 8, 1244);
    			attr_dev(div7, "class", "white-thumbnail center-align svelte-ap6212");
    			add_location(div7, file$2, 28, 8, 1354);
    			attr_dev(div8, "class", "mini-blog svelte-ap6212");
    			add_location(div8, file$2, 26, 6, 1211);
    			attr_dev(div9, "class", "image svelte-ap6212");
    			set_style(div9, "background-image", "url('images/finger-pointing-at-javascript-code.jpg')");
    			add_location(div9, file$2, 31, 8, 1585);
    			attr_dev(div10, "class", "white-thumbnail center-align svelte-ap6212");
    			add_location(div10, file$2, 32, 8, 1698);
    			attr_dev(div11, "class", "mini-blog mt15 svelte-ap6212");
    			add_location(div11, file$2, 30, 6, 1547);
    			attr_dev(div12, "class", "blog-container w30 svelte-ap6212");
    			add_location(div12, file$2, 25, 4, 1171);
    			attr_dev(div13, "class", "flex-container svelte-ap6212");
    			add_location(div13, file$2, 8, 2, 306);
    			attr_dev(section, "class", "main-bgcolor svelte-ap6212");
    			add_location(section, file$2, 7, 0, 272);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div13);
    			append_dev(div13, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, b0);
    			append_dev(b0, t1);
    			append_dev(b0, br0);
    			append_dev(b0, t2);
    			append_dev(b0, br1);
    			append_dev(b0, t3);
    			append_dev(div1, br2);
    			append_dev(div1, t4);
    			append_dev(div13, t5);
    			append_dev(div13, div5);
    			append_dev(div5, div3);
    			append_dev(div5, t6);
    			append_dev(div5, div4);
    			append_dev(div4, b1);
    			append_dev(div13, t8);
    			append_dev(div13, div12);
    			append_dev(div12, div8);
    			append_dev(div8, div6);
    			append_dev(div8, t9);
    			append_dev(div8, div7);
    			append_dev(div12, t11);
    			append_dev(div12, div11);
    			append_dev(div11, div9);
    			append_dev(div11, t12);
    			append_dev(div11, div10);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { bannerData = {} } = $$props;
    	const writable_props = ["bannerData"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Banner> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("bannerData" in $$props) $$invalidate(0, bannerData = $$props.bannerData);
    	};

    	$$self.$capture_state = () => {
    		return { bannerData };
    	};

    	$$self.$inject_state = $$props => {
    		if ("bannerData" in $$props) $$invalidate(0, bannerData = $$props.bannerData);
    	};

    	return [bannerData];
    }

    class Banner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { bannerData: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Banner",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get bannerData() {
    		throw new Error("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bannerData(value) {
    		throw new Error("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.16.7 */

    const { Error: Error_1, Object: Object_1 } = globals;

    function create_fragment$3(ctx) {
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		return {
    			props: { params: /*componentParams*/ ctx[1] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = {};
    			if (dirty & /*componentParams*/ 2) switch_instance_changes.params = /*componentParams*/ ctx[1];

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	const qsPosition = location.indexOf("?");
    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(getLocation(), function start(set) {
    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    function link(node) {
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	const href = node.getAttribute("href");

    	if (!href || href.length < 1 || href.charAt(0) != "/") {
    		throw Error("Invalid value for \"href\" attribute");
    	}

    	node.setAttribute("href", "#" + href);
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $loc,
    		$$unsubscribe_loc = noop;

    	validate_store(loc, "loc");
    	component_subscribe($$self, loc, $$value => $$invalidate(4, $loc = $$value));
    	$$self.$$.on_destroy.push(() => $$unsubscribe_loc());
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;

    	class RouteItem {
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument");
    			}

    			const { pattern, keys } = regexparam(path);
    			this.path = path;

    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.route;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    			} else {
    				this.component = component;
    				this.conditions = [];
    				this.userData = undefined;
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		match(path) {
    			if (prefix && path.startsWith(prefix)) {
    				path = path.substr(prefix.length) || "/";
    			}

    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				out[this._keys[i]] = matches[++i] || null;
    			}

    			return out;
    		}

    		checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	const routesIterable = routes instanceof Map ? routes : Object.entries(routes);
    	const routesList = [];

    	for (const [path, route] of routesIterable) {
    		routesList.push(new RouteItem(path, route));
    	}

    	let component = null;
    	let componentParams = {};
    	const dispatch = createEventDispatcher();

    	const dispatchNextTick = (name, detail) => {
    		setTimeout(
    			() => {
    				dispatch(name, detail);
    			},
    			0
    		);
    	};

    	const writable_props = ["routes", "prefix"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("routes" in $$props) $$invalidate(2, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(3, prefix = $$props.prefix);
    	};

    	$$self.$capture_state = () => {
    		return {
    			routes,
    			prefix,
    			component,
    			componentParams,
    			$loc
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(2, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(3, prefix = $$props.prefix);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ("$loc" in $$props) loc.set($loc = $$props.$loc);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*component, $loc*/ 17) {
    			 {
    				$$invalidate(0, component = null);
    				let i = 0;

    				while (!component && i < routesList.length) {
    					const match = routesList[i].match($loc.location);

    					if (match) {
    						const detail = {
    							component: routesList[i].component,
    							name: routesList[i].component.name,
    							location: $loc.location,
    							querystring: $loc.querystring,
    							userData: routesList[i].userData
    						};

    						if (!routesList[i].checkConditions(detail)) {
    							dispatchNextTick("conditionsFailed", detail);
    							break;
    						}

    						$$invalidate(0, component = routesList[i].component);
    						$$invalidate(1, componentParams = match);
    						dispatchNextTick("routeLoaded", detail);
    					}

    					i++;
    				}
    			}
    		}
    	};

    	return [component, componentParams, routes, prefix];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { routes: 2, prefix: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Home\Sections\SingleSection.svelte generated by Svelte v3.16.7 */
    const file$3 = "src\\Components\\Home\\Sections\\SingleSection.svelte";

    // (15:2) {:else}
    function create_else_block(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let h4;
    	let t1_value = /*section*/ ctx[0].label + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*section*/ ctx[0].description + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			h4 = element("h4");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			if (img.src !== (img_src_value = /*section*/ ctx[0].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*section*/ ctx[0].label);
    			attr_dev(img, "class", "section-img svelte-hw6no9");
    			add_location(img, file$3, 16, 6, 499);
    			attr_dev(h4, "class", "svelte-hw6no9");
    			add_location(h4, file$3, 17, 6, 574);
    			add_location(p, file$3, 18, 6, 606);
    			attr_dev(div, "class", "col-md-4 section svelte-hw6no9");
    			add_location(div, file$3, 15, 4, 461);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, h4);
    			append_dev(h4, t1);
    			append_dev(div, t2);
    			append_dev(div, p);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*section*/ 1 && img.src !== (img_src_value = /*section*/ ctx[0].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*section*/ 1 && img_alt_value !== (img_alt_value = /*section*/ ctx[0].label)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*section*/ 1 && t1_value !== (t1_value = /*section*/ ctx[0].label + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*section*/ 1 && t3_value !== (t3_value = /*section*/ ctx[0].description + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(15:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (7:2) {#if section.page}
    function create_if_block(ctx) {
    	let div;
    	let a;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let h4;
    	let t1_value = /*section*/ ctx[0].label + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*section*/ ctx[0].description + "";
    	let t3;
    	let a_href_value;
    	let link_action;
    	let div_class_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			img = element("img");
    			t0 = space();
    			h4 = element("h4");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			if (img.src !== (img_src_value = /*section*/ ctx[0].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*section*/ ctx[0].label);
    			attr_dev(img, "class", "section-img svelte-hw6no9");
    			add_location(img, file$3, 9, 10, 277);
    			attr_dev(h4, "class", "svelte-hw6no9");
    			add_location(h4, file$3, 10, 10, 356);
    			add_location(p, file$3, 11, 10, 392);
    			attr_dev(a, "href", a_href_value = /*section*/ ctx[0].page);
    			attr_dev(a, "class", "partner-link svelte-hw6no9");
    			add_location(a, file$3, 8, 6, 212);
    			attr_dev(div, "class", div_class_value = "col-md-4 section " + /*backgroundColor*/ ctx[1] + "-link" + " svelte-hw6no9");
    			add_location(div, file$3, 7, 4, 151);
    			dispose = action_destroyer(link_action = link.call(null, a));
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, img);
    			append_dev(a, t0);
    			append_dev(a, h4);
    			append_dev(h4, t1);
    			append_dev(a, t2);
    			append_dev(a, p);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*section*/ 1 && img.src !== (img_src_value = /*section*/ ctx[0].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*section*/ 1 && img_alt_value !== (img_alt_value = /*section*/ ctx[0].label)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*section*/ 1 && t1_value !== (t1_value = /*section*/ ctx[0].label + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*section*/ 1 && t3_value !== (t3_value = /*section*/ ctx[0].description + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*section*/ 1 && a_href_value !== (a_href_value = /*section*/ ctx[0].page)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*backgroundColor*/ 2 && div_class_value !== (div_class_value = "col-md-4 section " + /*backgroundColor*/ ctx[1] + "-link" + " svelte-hw6no9")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(7:2) {#if section.page}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*section*/ ctx[0].page) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { section } = $$props;
    	let { backgroundColor = "" } = $$props;
    	const writable_props = ["section", "backgroundColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SingleSection> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("section" in $$props) $$invalidate(0, section = $$props.section);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	$$self.$capture_state = () => {
    		return { section, backgroundColor };
    	};

    	$$self.$inject_state = $$props => {
    		if ("section" in $$props) $$invalidate(0, section = $$props.section);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	return [section, backgroundColor];
    }

    class SingleSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { section: 0, backgroundColor: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SingleSection",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*section*/ ctx[0] === undefined && !("section" in props)) {
    			console.warn("<SingleSection> was created without expected prop 'section'");
    		}
    	}

    	get section() {
    		throw new Error("<SingleSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set section(value) {
    		throw new Error("<SingleSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<SingleSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<SingleSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Home\Sections\Sections.svelte generated by Svelte v3.16.7 */
    const file$4 = "src\\Components\\Home\\Sections\\Sections.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (19:6) {#each sectionList as sectionItem}
    function create_each_block$1(ctx) {
    	let current;

    	const singlesection = new SingleSection({
    			props: {
    				section: /*sectionItem*/ ctx[5],
    				backgroundColor: /*backgroundColor*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(singlesection.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(singlesection, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const singlesection_changes = {};
    			if (dirty & /*sectionList*/ 16) singlesection_changes.section = /*sectionItem*/ ctx[5];
    			if (dirty & /*backgroundColor*/ 4) singlesection_changes.backgroundColor = /*backgroundColor*/ ctx[2];
    			singlesection.$set(singlesection_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(singlesection.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(singlesection.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(singlesection, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(19:6) {#each sectionList as sectionItem}",
    		ctx
    	});

    	return block;
    }

    // (23:4) {#if linkAll.url}
    function create_if_block$1(ctx) {
    	let a;
    	let t_value = /*linkAll*/ ctx[3].name + "";
    	let t;
    	let a_href_value;
    	let link_action;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", a_href_value = /*linkAll*/ ctx[3].url);
    			attr_dev(a, "class", "svelte-pfpvtv");
    			add_location(a, file$4, 23, 4, 788);
    			dispose = action_destroyer(link_action = link.call(null, a));
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*linkAll*/ 8 && t_value !== (t_value = /*linkAll*/ ctx[3].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*linkAll*/ 8 && a_href_value !== (a_href_value = /*linkAll*/ ctx[3].url)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(23:4) {#if linkAll.url}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let section_1;
    	let div1;
    	let h2;
    	let t0;
    	let t1;
    	let div0;
    	let t2;
    	let section_1_class_value;
    	let current;
    	let each_value = /*sectionList*/ ctx[4];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*linkAll*/ ctx[3].url && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			section_1 = element("section");
    			div1 = element("div");
    			h2 = element("h2");
    			t0 = text(/*heading*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			if (if_block) if_block.c();
    			attr_dev(h2, "class", "title text-center svelte-pfpvtv");
    			add_location(h2, file$4, 16, 4, 514);
    			attr_dev(div0, "class", "row section-body centered-elts svelte-pfpvtv");
    			add_location(div0, file$4, 17, 4, 564);
    			attr_dev(div1, "class", "container text-center");
    			add_location(div1, file$4, 15, 2, 473);
    			attr_dev(section_1, "id", /*section*/ ctx[1]);
    			attr_dev(section_1, "class", section_1_class_value = "section " + /*backgroundColor*/ ctx[2] + " svelte-pfpvtv");
    			add_location(section_1, file$4, 14, 0, 413);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section_1, anchor);
    			append_dev(section_1, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div1, t2);
    			if (if_block) if_block.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*heading*/ 1) set_data_dev(t0, /*heading*/ ctx[0]);

    			if (dirty & /*sectionList, backgroundColor*/ 20) {
    				each_value = /*sectionList*/ ctx[4];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*linkAll*/ ctx[3].url) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (!current || dirty & /*section*/ 2) {
    				attr_dev(section_1, "id", /*section*/ ctx[1]);
    			}

    			if (!current || dirty & /*backgroundColor*/ 4 && section_1_class_value !== (section_1_class_value = "section " + /*backgroundColor*/ ctx[2] + " svelte-pfpvtv")) {
    				attr_dev(section_1, "class", section_1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section_1);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { heading } = $$props;
    	let { section } = $$props;
    	let { backgroundColor = "" } = $$props;
    	let { linkAll = "" } = $$props;
    	let { sectionList = [] } = $$props;
    	const writable_props = ["heading", "section", "backgroundColor", "linkAll", "sectionList"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Sections> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("heading" in $$props) $$invalidate(0, heading = $$props.heading);
    		if ("section" in $$props) $$invalidate(1, section = $$props.section);
    		if ("backgroundColor" in $$props) $$invalidate(2, backgroundColor = $$props.backgroundColor);
    		if ("linkAll" in $$props) $$invalidate(3, linkAll = $$props.linkAll);
    		if ("sectionList" in $$props) $$invalidate(4, sectionList = $$props.sectionList);
    	};

    	$$self.$capture_state = () => {
    		return {
    			heading,
    			section,
    			backgroundColor,
    			linkAll,
    			sectionList
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("heading" in $$props) $$invalidate(0, heading = $$props.heading);
    		if ("section" in $$props) $$invalidate(1, section = $$props.section);
    		if ("backgroundColor" in $$props) $$invalidate(2, backgroundColor = $$props.backgroundColor);
    		if ("linkAll" in $$props) $$invalidate(3, linkAll = $$props.linkAll);
    		if ("sectionList" in $$props) $$invalidate(4, sectionList = $$props.sectionList);
    	};

    	return [heading, section, backgroundColor, linkAll, sectionList];
    }

    class Sections extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			heading: 0,
    			section: 1,
    			backgroundColor: 2,
    			linkAll: 3,
    			sectionList: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sections",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*heading*/ ctx[0] === undefined && !("heading" in props)) {
    			console.warn("<Sections> was created without expected prop 'heading'");
    		}

    		if (/*section*/ ctx[1] === undefined && !("section" in props)) {
    			console.warn("<Sections> was created without expected prop 'section'");
    		}
    	}

    	get heading() {
    		throw new Error("<Sections>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set heading(value) {
    		throw new Error("<Sections>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get section() {
    		throw new Error("<Sections>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set section(value) {
    		throw new Error("<Sections>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<Sections>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<Sections>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get linkAll() {
    		throw new Error("<Sections>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set linkAll(value) {
    		throw new Error("<Sections>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sectionList() {
    		throw new Error("<Sections>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sectionList(value) {
    		throw new Error("<Sections>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Home\Social\Social.svelte generated by Svelte v3.16.7 */

    const file$5 = "src\\Components\\Home\\Social\\Social.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (10:6) {#each socials as social}
    function create_each_block$2(ctx) {
    	let a;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			t = space();
    			if (img.src !== (img_src_value = /*social*/ ctx[3].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "Social media " + /*social*/ ctx[3].image);
    			attr_dev(img, "class", "svelte-1x06ffb");
    			add_location(img, file$5, 11, 10, 363);
    			attr_dev(a, "href", a_href_value = /*social*/ ctx[3].url);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-1x06ffb");
    			add_location(a, file$5, 10, 8, 314);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    			append_dev(a, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(10:6) {#each socials as social}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let section;
    	let div1;
    	let h2;
    	let t1;
    	let div0;
    	let each_value = /*socials*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = `${/*title*/ ctx[1]}`;
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "title text-center");
    			add_location(h2, file$5, 7, 4, 184);
    			attr_dev(div0, "class", "social-icons section-body svelte-1x06ffb");
    			add_location(div0, file$5, 8, 4, 232);
    			attr_dev(div1, "class", "container text-center");
    			add_location(div1, file$5, 6, 2, 143);
    			attr_dev(section, "id", "social-media");
    			attr_dev(section, "class", "section");
    			add_location(section, file$5, 5, 0, 96);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div1);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*socials*/ 1) {
    				each_value = /*socials*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { socialData = {} } = $$props;
    	const { socials, title } = socialData;
    	const writable_props = ["socialData"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Social> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("socialData" in $$props) $$invalidate(2, socialData = $$props.socialData);
    	};

    	$$self.$capture_state = () => {
    		return { socialData };
    	};

    	$$self.$inject_state = $$props => {
    		if ("socialData" in $$props) $$invalidate(2, socialData = $$props.socialData);
    	};

    	return [socials, title, socialData];
    }

    class Social extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { socialData: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Social",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get socialData() {
    		throw new Error("<Social>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set socialData(value) {
    		throw new Error("<Social>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const baseUrl = "/offers/";
    let offers = [
        {
            label: "Go Data",
            description:
                "Libérez le potentiel de vos données, anticipez, et gagnez en réactivité dans vos prises de décision et vos choix stratégiques.",
            image: "images/thumbnails/computing.png",
            page: baseUrl + "go-data"
        },
        {
            label: "Go Fast",
            description:
                "Bénéficiez d'une installation rapide d'Office 365 et des services Eliade associés, à coûts maitrisés.",
            image: "images/thumbnails/rocket.png",
            page: baseUrl + "go-fast"
        },
        {
            label: "Go Smart",
            description:
                "Profitez des services avancés Eliade pour optimiser votre transition vers les solutions O365.",
            image: "images/thumbnails/business.png",
            page: baseUrl + "go-smart"
        },
        {
            label: "Go Teams",
            description:
                "Centralisez vos outils de collaboration et de communication sur une plateforme unique.",
            image: "images/thumbnails/conference.png",
            page: baseUrl + "go-teams"
        },
        {
            label: "Go Access & Security",
            description:
                "Protégez vos données depuis le Cloud, gérez vos équipements mobiles et gagnez en flexibilité.",
            image: "images/thumbnails/access.png",
            page: baseUrl + "go-access-security"
        },
        {
            label: "Go Finops",
            description:
                "Rubrique sans description sur le site original.",
            image: "images/thumbnails/finops.png",
            page: baseUrl + "go-finops"
        }
    ];

    let getOffers = () => offers;

    const baseUrl$1 = '/services/';
    let services = [
        {
            label: "Délégation de compétences",
            description: "Restez centré sur vos besoins métiers en externalisant chez Eliade.",
            text: "Face aux <b>enjeux stratégiques</b> de la disponibilité des systèmes d'information, la <b>délégation de compétences</b> garantit un niveau de service adapté à vos besoins.<br><br>En externalisant certaines tâches, vous <b>resterez centré</b> sur vos métiers et vos collaborateurs se concentreront sur les projets à <b>fortes valeurs ajoutées</b>.<br><br>Eliade, <b>spécialiste des métiers de l'exploitation</b> et de la production informatique, vous proposera des profils ayant de nombreux retours d'expérience sur les considérations informatiques actuelles des grands comptes.<br><br>Quel que soit votre secteur d'activité (Retail, Banque Assurance, Industrie ...) la délégation de compétences vous permettra de bénéficier de l'expertise d'Eliade pour la durée de vos projets.<br><br>Cette souplesse vous permettra d'<b>optimiser vos budgets informatiques</b> en ajustant au mieux la durée de prestation.",
            image: "images/thumbnails/delegation.png",
            section: "skills",
            page: baseUrl$1 + "skills"
        },
        {
            label: "Audit et conseil",
            description: "Tirez le meilleur profit de votre système d'information.",
            text: "<b>Eliade</b> propose un <b>audit permettant de mettre en évidence les points faibles et les points forts de vos infrastructures</b>.À l'issue de cette phase d'audit, nos experts émettront les préconisations nécessaires à l'optimisation et la sécurisation de votre système d'information.<br><br>Au besoin, l'équipe projet pourra vous <b>accompagner dans la mise en œuvre</b> des préconisations de manière fiable et efficace. Le but étant que vous puissiez tirer <b>le meilleur profit</b> de votre système d'information.<br><br>Notre expertise doit être un soutien pour des décideurs qui ne sont pas obligatoirement familiarisés avec les <b>aspects techniques de leur système d'information</b>.",
            image: "images/thumbnails/audits.png",
            section: "audit",
            page: baseUrl$1 + "audit"
        },
        {
            label: "Projet et expertise",
            description: "Profitez de l'expertise de nos collaborateurs.",
            text: "Le pôle Projet & Expertise a pour objectif de <b>vous accompagner</b> dans les phases d'implémentation et/ou d'évolution des <b>infrastructures Microsoft</b> (à demeure ou dans le cloud) et des solutions connexes (Kemp, Barracuda…).<br><br>Les collaborateurs du département « Projet et Expertise » interviennent uniquement en mode projet ou en expertise <b>ponctuelle</b>. Ils sont <b>certifiés sur les solutions liées à leurs spécialités</b> : Exchange, Lync, Active Directory, Azure, Kemp, etc.<br><br>Deux de nos collaborateurs sont certifiés <b>« formateurs officiels Microsoft »</b> (MCT). Pour garantir la qualité de nos projets, l'un de nos collaborateurs est également <b>certifié « Prince2 »</b> (méthode projet reconnue dans le monde de l'IT).<br><br>L'expertise d'<b>Eliade</b> lui a permis d'intégrer le programme <b>Partner Seller</b> (P-Seller) mis en place par Microsoft, ce programme est composé d'une centaine d'experts sélectionnés parmi l'élite de la communauté de partenaires de Microsoft. Leur rôle principal est de communiquer la valeur des solutions Microsoft aux clients et de leur fournir des conseils d'architecture de <b>solutions d'intégration d'entreprise</b>. Le programme Microsoft Partner Seller a été conçu pour <b>faciliter la relation</b> avec les partenaires Microsoft ainsi que les équipes produits au niveau national et régional. Ce programme permet ainsi à des experts partenaires de réaliser des avant-ventes, d'assurer la partie « technico-commerciale », de <b>cadrer le besoin du client</b> et vérifier que la technologie correspond et peut répondre à leur demande.",
            image: "images/thumbnails/meeting.png",
            section: "project",
            page: baseUrl$1 + "project"
        },
        {
            label: "Formation d'expertise Traineed",
            description: "Formez vos équipes informatiques sur les solutions Microsoft.",
            text : "Pour vous accompagner aux mieux dans vos projets IT et dans la prise en main des nouveaux outils, <b>Eliade</b> propose son offre de formation d'expertise Traineed <b>à destination de vos équipes informatiques</b>.<br><br>Organisme de formation agréé, Eliade propose des sessions de formation apportant à vos équipes informatiques les bases nécessaires à l'administration quotidienne et facilitant la <b>mise en place des solutions Microsoft</b>. Ces formations se basent sur les cours officiels Microsoft et pourront être adaptées en fonction de vos attentes et contraintes.<br><br>Des ouvrages spécifiques aux technologies Microsoft présentées sont systématiquement proposés. Les sessions destinées aux utilisateurs finaux se basent sur des apports théoriques et pratiques visant à apporter les connaissances nécessaires à l'utilisation des nouvelles fonctionnalités et des nouveaux usages.<br><br>Totalement interactives, ces formations permettent de sensibiliser aux mieux les utilisateurs. <b>À l'issue de chaque session, un support pédagogique est remis à chaque participant</b> afin d'accéder rapidement aux fonctionnalités essentielles du produit présenté. Ces formations sont assurées par les membres du département Projet et Expertise qui possèdent de <b>nombreuses certifications</b> (Notamment Microsoft Certified Trainer) et de nombreux retours d'expérience.",
            image: "images/thumbnails/training.png",
            section: "traineed",
            page: baseUrl$1 + "traineed"
        },
        {
            label: "Support et assistance Manageo",
            description: "Bénéficiez d'un accès privilégié au support Manageo Eliade.",
            text: "L'offre MANAGEO d'Eliade permet à nos clients de <b>bénéficier d'un support technique</b> de niveau 3 assuré par des consultants experts sur les technologies Microsoft.<br><br>Ce support est une réassurance pour votre infrastructure, vos équipes informatiques internes peuvent ainsi se <b>focaliser sur leurs besoins métiers. Ce service est ouvert du lundi au vendredi (hors jours fériés)</b> et peut être associé <b>au plus haut niveau de support Microsoft (Support Premier)</b>. La voilure du contrat et les technologies Microsoft à couvrir sont définies à la souscription.<br><br>Notre <b>proximité</b> et nos retours d'expérience sont les facteurs différenciateurs de cette offre de support.",
            image: "images/thumbnails/friends2.png",
            section : "manageo",
            page: baseUrl$1 + "manageo"
        },
        {
            label: "Conduite du changement",
            description: "Accompagnez vos utilisateurs finaux sur les solutions Office 365.",
            text : "<b>Tout projet de transformation numérique entraîne un changement</b> au sein de l'entreprise. Ces changements peuvent parfois <b>causer des réactions de résistance ou de désengagement de la part des utilisateurs</b>. Nos retours d'expérience sur les projets de passages à Office 365 nous prouvent qu'il est nécessaire d'adopter une méthodologie permettant de prévenir et de gérer les aspects humains.<br><br>Partant de ce constat, nous avons <b>mis en place une méthode de conduite du changement visant à impliquer et à informer les utilisateurs finaux dans le projet</b>. Cette démarche facilite l'acceptation et permet d'obtenir l'adhésion des membres de l'entreprise au projet de changement.",
            image: "images/thumbnails/team.png",
            section: "changes",
            page: baseUrl$1 + "changes"
        }
    ];

    let getServices = () => services;
    let getLinkAll = () => { return { name: "Tous nos services", url: "/services" } };

    const baseUrl$2 = "/partners/";
    let partners = [
        {
            label: "Kemp",
            description: "KEMP Technologies fournit des Load Balancer et LoadMaster pour les entreprises de toute taille.",
            image: "images/partners/kemp.png",
            id: "kemp",
            url: "https://www.youtube.com/embed/yiQQBvatGuo",
            text: "<b>KEMP</b> Technologies propose des <b>solutions d'équilibrage de charges</b> (Load Balancing) et de publication d'applications (<b>Reverse Proxy</b>). Depuis l'arrêt de commercialisation de la solution Microsoft TMG (Threat Management Gateway), KEMP se positionne comme <b>une alternative performante et fiable</b>. Ils proposent également une solution de Pare-feu applicatif (WAF) permettant de bloquer de nombreuses attaques.<br><br>Partenaire Gold Microsoft, KEMP est une solution préconisée par l'éditeur pour la publication de services comme <b>Exchange</b> pour les modes hybride avec <b>O365</b> mais également l'équilibrage de charges des <b>solutions On Premise</b> (Exchange, Skype For Business, SharePoint...).",
            index: 0,
            page: baseUrl$2 + 0
        },
        {
            label: "Letsignit",
            description: "Standardisez et gérez les signatures mails de vos collaborateurs.",
            image: "images/partners/letsignit.png",
            id: "letsignit",
            url: "https://www.youtube.com/embed/i7-EmRKTBck",
            text: "Letsignit est une solution centralisée de gestion de signatures mails.<br>En quelques clics, Letsignit permet simplement de créer et de distribuer des signatures mails automatisées pour tous les utilisateurs d'Office 365 !<br><b>L'image de marque est ainsi boostée et la communication amplifiée au travers de tous les emails professionnels.</b><br><br>Les emails sont une vraie mine d'or ! 121 emails professionnels sont reçus et 40 sont envoyés par un salarié chaque jour. Avec Letsignit, transformez chaque email en puissante opportunité de communication : adressez le bon message, à la bonne personne, au bon moment !<br><br><b>Tout automatique !</b> Avec Letsignit App, les signatures sont intégrées à chaque nouveau courriel dans Outlook. Letsignit API permet de couvrir les collaborateurs qui utilisent OWA.<br>Facile à CRÉER, facile à UTILISER, facile à DÉPLOYER.<br><b>Transformez vos signatures mails en puissant atout de communication avec Letsignit !</b>",
            index: 1,
            page: baseUrl$2 + 1
        },
        {
            label: "Poly",
            description: "L'un des leaders mondiaux dans les communications audio pour les entreprises et le grand public.",
            image: "images/partners/poly.png",
            id: "poly",
            url: "https://www.youtube.com/embed/llHa5vUq5PI",
            text: "Depuis <b>50 ans</b>, Poly explore toutes les facettes <b>des technologies audio et propose des produits innovants</b> qui permettent à tous de communiquer, simplement. Des solutions de <b>communication unifiée</b> aux oreillettes Bluetooth, Plantronics offre une qualité sans compromis, <b>une expérience conviviale</b> et un service irréprochable.<br><br>Poly est aujourd'hui utilisé par toutes les entreprises du « Fortune 100 », ainsi que par le centre des urgences 911, le contrôle du trafic aérien et le New York Stock Exchange.<br><br>Depuis les communications unifiées jusqu'aux micro-casques et oreillettes Bluetooth, les produits Poly <b>simplifient la communication</b>.",
            index: 2,
            page: baseUrl$2 + 2
        },
        {
            label: "Jabra",
            description: "Micro-casques pour une meilleure concentration et des conversations de qualité.",
            image: "images/partners/jabra.png",
            id: "jabra",
            url: "https://www.youtube.com/embed/mA1qCnk4Lg4",
            text: "Les entreprises sont de plus en plus amenées à <b>communiquer malgré la distance</b>. Dans ce contexte <b>Jabra</b> vous offre des <b>outils audio de qualité</b> pour optimiser vos communications.<br><br>Leurs micros-casques permettent d'être <b>plus productif, plus concentré et de communiquer et collaborer plus facilement</b>. Ces solutions rendent également vos conversations plus <b>fluides en bloquant les bruits indésirables</b> et en restituant un son d'une grande clarté.<br><br>La volonté de Jabra : repousser les limites de l'innovation et des performances : c'est pourquoi les équipes déploient tous leurs efforts pour améliorer sans cesse la qualité audio de nos appareils.<br><br>Leader en matière de son, la société consacre chaque année plus de 10% de son chiffre d'affaires à la <b>recherche et au développement</b>. Cette stratégie  permet à Jabra de rester à la <b>pointe de l'innovation technologique</b>.",
            index: 3,
            page: baseUrl$2 + 3
        },
        {
            label: "Microsoft Surface",
            description: "Votre environnement de travail dans une tablette.",
            image: "images/partners/mss.png",
            id: "mssurface",
            url: "https://www.youtube.com/embed/mA1qCnk4Lg4",
            text: "Avec l'accélération du business, <b>les collaborateurs</b> doivent être plus agiles et réactifs. Ils aiment avoir des tablettes mais ont besoin de la <b>puissance</b> d'un véritable ordinateur pour effectuer leur travail et généralement, ils se retrouvent à se déplacer avec les deux.<br><br>Surface apparait alors comme <b>l'appareil idéal</b> pour une personne fréquemment en déplacement lui permettant d'investir tout son temps à son <b>cœur de métier</b>.<br><br>Les appareils Surface sont conçus de façon méticuleuse par Microsoft au moyen des <b>technologies les plus avancées</b>. Dotée d'un processeur Intel, de Windows Pro, d'un clavier clipsable, et d'une <b>qualité rivalisant de réalité grâce à PixelSense™</b>, Surface s'utilise comme un portable et <b>exécute les logiciels de bureau qui vous sont indispensables</b>.<br></br>Enfin, grâce à ses <b>multiples ports</b> et <b>son stylet</b>, Surface redéfinit la <b>productivité où que vous soyez</b>, au bureau, dans un atelier ou dans un café.",
            index: 4,
            page: baseUrl$2 + 4
        },
        {
            label: "BitTitan",
            description: "Rubrique sans description sur le site original.",
            image: "images/partners/bittitan.png",
            id: "bittitan",
            url: "https://www.youtube.com/embed/awAFxatDOK4",
            text: "Avec BitTitan, migrez vos boites mails, vos documents, de partout où et à n'importe quel moment.<br><br>BitTian est une plateforme SaaS conçue pour aider les entreprises à organiser, optimiser et automatiser leur migration.<br><br></br>Compatible avec Lotus Note, Gsuite, O365 ...",
            index: 5,
            page: baseUrl$2 + 5
        }
    ];

    let getPartners = () => partners;
    let getLinkAll$1 = () => { return { name: "Tous nos partenaires", url: "/partners" } };

    let baseUrl$3 = "/company/";
    let company = [
        {
            label: "Recrutement",
            description: "Toutes nos offres d'emploi.",
            image: "images/thumbnails/list.png",
            page: baseUrl$3 + "recruiting"
        },
        {
            label: "Nos certifications",
            description: "",
            image: "images/thumbnails/statistics.png",
            page: baseUrl$3 + "certifications"
        },
        {
            label: "Pôles de compétences",
            description: "",
            image: "images/thumbnails/tool.png",
            page: baseUrl$3 + "skills"
        }
    ];

    let getCompany = () => company;

    const socialData = {
        title: "Retrouvez-nous sur les réseaux sociaux",
        socials: [
          { image: "images/facebook-icon.png", url: "https://www.facebook.com/eliade.experts/"},
          { image: "images/linkedin-icon.png", url: "https://www.linkedin.com/company/eliade/"},
        ]
    };

    const navbarData = [
      { id: 1, url: "#company", label: "Notre entreprise" },
      { id: 2, url: "#services", label: "Nos services" },
      { id: 3, url: "#offers", label: "Nos offres" },
      { id: 4, url: "#partners", label: "Nos partenaires" },
      { id: 5, url: "#contacts", label: "Contacts" }
    ];

    const footerData = {
      description:
        "Créée en 2001, Eliade est une société de services experte des solutions Microsoft, qui se place aujourd'hui comme un acteur incontournable dans la région des Hauts de France.",
      contactDetails: {
        title: "Contactez-nous",
        address: `120 Avenue Clément Ader<br>Parc d'Activité Du Moulin<br>59118 Wambrechies`,
        mobile: "03 20 80 02 96",
        email: "contact@eliade.fr"
      },
      subscribeNewsletter: "Subscribe newsletter",
      subscribe: "Subscribe"
    };

    const header = "Eliade";

    const getSocialData = () => socialData;
    const getNavbarData = () => navbarData;
    const getFooterData = () => footerData;
    const getHeader = () => header;

    /* src\Components\Home\Home.svelte generated by Svelte v3.16.7 */

    function create_fragment$7(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;
    	const banner = new Banner({ $$inline: true });

    	const sections0 = new Sections({
    			props: {
    				section: "company",
    				heading: "Notre entreprise",
    				backgroundColor: "light-color",
    				sectionList: getCompany()
    			},
    			$$inline: true
    		});

    	const sections1 = new Sections({
    			props: {
    				section: "services",
    				heading: "Nos services",
    				backgroundColor: "main-bgcolor",
    				linkAll: getLinkAll(),
    				sectionList: getServices()
    			},
    			$$inline: true
    		});

    	const sections2 = new Sections({
    			props: {
    				section: "offers",
    				heading: "Nos offres",
    				backgroundColor: "light-color",
    				sectionList: getOffers()
    			},
    			$$inline: true
    		});

    	const sections3 = new Sections({
    			props: {
    				section: "partners",
    				heading: "Nos partenaires",
    				backgroundColor: "main-bgcolor",
    				linkAll: getLinkAll$1(),
    				sectionList: getPartners()
    			},
    			$$inline: true
    		});

    	const social = new Social({
    			props: { socialData: getSocialData() },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(banner.$$.fragment);
    			t0 = space();
    			create_component(sections0.$$.fragment);
    			t1 = space();
    			create_component(sections1.$$.fragment);
    			t2 = space();
    			create_component(sections2.$$.fragment);
    			t3 = space();
    			create_component(sections3.$$.fragment);
    			t4 = space();
    			create_component(social.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(banner, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(sections0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(sections1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(sections2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(sections3, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(social, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(banner.$$.fragment, local);
    			transition_in(sections0.$$.fragment, local);
    			transition_in(sections1.$$.fragment, local);
    			transition_in(sections2.$$.fragment, local);
    			transition_in(sections3.$$.fragment, local);
    			transition_in(social.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(banner.$$.fragment, local);
    			transition_out(sections0.$$.fragment, local);
    			transition_out(sections1.$$.fragment, local);
    			transition_out(sections2.$$.fragment, local);
    			transition_out(sections3.$$.fragment, local);
    			transition_out(social.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(banner, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(sections0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(sections1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(sections2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(sections3, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(social, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    let getNextIndex = (index, array) => {
        if(index === array.length - 1){
            return 0;
        }
        else {
            return index + 1;
        }
    };

    let getPreviousIndex = (index, array) => {
        if(index === 0){
            return array.length - 1;
        }
        else {
            return index - 1;
        }
    };

    /* src\Components\Details\Partners.svelte generated by Svelte v3.16.7 */
    const file$6 = "src\\Components\\Details\\Partners.svelte";

    // (57:4) {#if shouldDisplay}
    function create_if_block$2(ctx) {
    	let div;
    	let iframe;
    	let iframe_src_value;
    	let iframe_title_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			iframe = element("iframe");
    			if (iframe.src !== (iframe_src_value = /*currentVideo*/ ctx[0].url)) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "title", iframe_title_value = /*currentVideo*/ ctx[0].label);
    			attr_dev(iframe, "class", "resp-iframe svelte-3g1lk5");
    			add_location(iframe, file$6, 58, 12, 1720);
    			attr_dev(div, "class", "video svelte-3g1lk5");
    			add_location(div, file$6, 57, 8, 1687);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, iframe);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentVideo*/ 1 && iframe.src !== (iframe_src_value = /*currentVideo*/ ctx[0].url)) {
    				attr_dev(iframe, "src", iframe_src_value);
    			}

    			if (dirty & /*currentVideo*/ 1 && iframe_title_value !== (iframe_title_value = /*currentVideo*/ ctx[0].label)) {
    				attr_dev(iframe, "title", iframe_title_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(57:4) {#if shouldDisplay}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div3;
    	let button0;
    	let i0;
    	let div0;
    	let t0_value = /*previousVideo*/ ctx[3].label + "";
    	let t0;
    	let t1;
    	let t2;
    	let div1;
    	let h1;
    	let t3_value = /*currentVideo*/ ctx[0].label + "";
    	let t3;
    	let t4;
    	let p;
    	let raw_value = /*currentVideo*/ ctx[0].text + "";
    	let t5;
    	let button1;
    	let div2;
    	let t6_value = /*nextVideo*/ ctx[2].label + "";
    	let t6;
    	let i1;
    	let dispose;
    	let if_block = /*shouldDisplay*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			button0 = element("button");
    			i0 = element("i");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			t3 = text(t3_value);
    			t4 = space();
    			p = element("p");
    			t5 = space();
    			button1 = element("button");
    			div2 = element("div");
    			t6 = text(t6_value);
    			i1 = element("i");
    			attr_dev(i0, "class", "left svelte-3g1lk5");
    			add_location(i0, file$6, 55, 77, 1569);
    			attr_dev(div0, "class", "button-label svelte-3g1lk5");
    			add_location(div0, file$6, 55, 97, 1589);
    			attr_dev(button0, "class", "btn btn-primary round-border svelte-3g1lk5");
    			add_location(button0, file$6, 55, 4, 1496);
    			add_location(h1, file$6, 62, 8, 1875);
    			attr_dev(p, "class", "svelte-3g1lk5");
    			add_location(p, file$6, 63, 8, 1914);
    			attr_dev(div1, "class", "description svelte-3g1lk5");
    			add_location(div1, file$6, 61, 4, 1840);
    			attr_dev(div2, "class", "button-label svelte-3g1lk5");
    			add_location(div2, file$6, 65, 73, 2033);
    			attr_dev(i1, "class", "right svelte-3g1lk5");
    			add_location(i1, file$6, 65, 122, 2082);
    			attr_dev(button1, "class", "btn btn-primary round-border svelte-3g1lk5");
    			add_location(button1, file$6, 65, 4, 1964);
    			attr_dev(div3, "class", "section resp-container grey-bgcolor svelte-3g1lk5");
    			add_location(div3, file$6, 54, 0, 1441);

    			dispose = [
    				listen_dev(button0, "click", /*goToPreviousLink*/ ctx[4], false, false, false),
    				listen_dev(button1, "click", /*goToNextLink*/ ctx[5], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, button0);
    			append_dev(button0, i0);
    			append_dev(button0, div0);
    			append_dev(div0, t0);
    			append_dev(div3, t1);
    			if (if_block) if_block.m(div3, null);
    			append_dev(div3, t2);
    			append_dev(div3, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t3);
    			append_dev(div1, t4);
    			append_dev(div1, p);
    			p.innerHTML = raw_value;
    			append_dev(div3, t5);
    			append_dev(div3, button1);
    			append_dev(button1, div2);
    			append_dev(div2, t6);
    			append_dev(button1, i1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*previousVideo*/ 8 && t0_value !== (t0_value = /*previousVideo*/ ctx[3].label + "")) set_data_dev(t0, t0_value);

    			if (/*shouldDisplay*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div3, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*currentVideo*/ 1 && t3_value !== (t3_value = /*currentVideo*/ ctx[0].label + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*currentVideo*/ 1 && raw_value !== (raw_value = /*currentVideo*/ ctx[0].text + "")) p.innerHTML = raw_value;			if (dirty & /*nextVideo*/ 4 && t6_value !== (t6_value = /*nextVideo*/ ctx[2].label + "")) set_data_dev(t6, t6_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { params = {} } = $$props;
    	let currentVideo;
    	let shouldDisplay;
    	let nextVideo;
    	let previousVideo;
    	let click = false;
    	let videos = getPartners();

    	let shouldDiplayVideo = video => {
    		return !!video.url;
    	};

    	let updateCurrentDisplay = () => {
    		$$invalidate(1, shouldDisplay = shouldDiplayVideo(currentVideo));
    		$$invalidate(3, previousVideo = videos[getPreviousIndex(currentVideo.index, videos)]);
    		$$invalidate(2, nextVideo = videos[getNextIndex(currentVideo.index, videos)]);
    	};

    	let goToPreviousLink = () => {
    		$$invalidate(0, currentVideo = videos[getPreviousIndex(currentVideo.index, videos)]);
    		updateCurrentDisplay();
    		click = true;
    	};

    	let goToNextLink = () => {
    		$$invalidate(0, currentVideo = videos[getNextIndex(currentVideo.index, videos)]);
    		updateCurrentDisplay();
    		click = true;
    	};

    	let autoTurn = () => {
    		if (!click) {
    			if (params.id) {
    				$$invalidate(0, currentVideo = videos[params.id]);
    			} else {
    				$$invalidate(0, currentVideo = videos[0]);
    			}

    			updateCurrentDisplay();
    		}
    	};

    	beforeUpdate(autoTurn);
    	window.scrollTo(0, 0);
    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Partners> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("params" in $$props) $$invalidate(6, params = $$props.params);
    	};

    	$$self.$capture_state = () => {
    		return {
    			params,
    			currentVideo,
    			shouldDisplay,
    			nextVideo,
    			previousVideo,
    			click,
    			videos,
    			shouldDiplayVideo,
    			updateCurrentDisplay,
    			goToPreviousLink,
    			goToNextLink,
    			autoTurn
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(6, params = $$props.params);
    		if ("currentVideo" in $$props) $$invalidate(0, currentVideo = $$props.currentVideo);
    		if ("shouldDisplay" in $$props) $$invalidate(1, shouldDisplay = $$props.shouldDisplay);
    		if ("nextVideo" in $$props) $$invalidate(2, nextVideo = $$props.nextVideo);
    		if ("previousVideo" in $$props) $$invalidate(3, previousVideo = $$props.previousVideo);
    		if ("click" in $$props) click = $$props.click;
    		if ("videos" in $$props) videos = $$props.videos;
    		if ("shouldDiplayVideo" in $$props) shouldDiplayVideo = $$props.shouldDiplayVideo;
    		if ("updateCurrentDisplay" in $$props) updateCurrentDisplay = $$props.updateCurrentDisplay;
    		if ("goToPreviousLink" in $$props) $$invalidate(4, goToPreviousLink = $$props.goToPreviousLink);
    		if ("goToNextLink" in $$props) $$invalidate(5, goToNextLink = $$props.goToNextLink);
    		if ("autoTurn" in $$props) autoTurn = $$props.autoTurn;
    	};

    	return [
    		currentVideo,
    		shouldDisplay,
    		nextVideo,
    		previousVideo,
    		goToPreviousLink,
    		goToNextLink,
    		params
    	];
    }

    class Partners extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$8, safe_not_equal, { params: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Partners",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get params() {
    		throw new Error("<Partners>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<Partners>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Details\Services.svelte generated by Svelte v3.16.7 */
    const file$7 = "src\\Components\\Details\\Services.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i].label;
    	child_ctx[4] = list[i].text;
    	child_ctx[5] = list[i].section;
    	return child_ctx;
    }

    // (31:0) {#each services as { label, text, section }}
    function create_each_block$3(ctx) {
    	let section;
    	let div;
    	let h1;
    	let t0_value = /*label*/ ctx[3] + "";
    	let t0;
    	let t1;
    	let p;
    	let raw_value = /*text*/ ctx[4] + "";
    	let t2;
    	let section_id_value;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = space();
    			attr_dev(h1, "class", "title svelte-12q65b3");
    			add_location(h1, file$7, 33, 8, 851);
    			attr_dev(p, "class", "description svelte-12q65b3");
    			add_location(p, file$7, 34, 8, 891);
    			attr_dev(div, "class", "section grey-bgcolor");
    			add_location(div, file$7, 32, 6, 807);
    			attr_dev(section, "id", section_id_value = /*section*/ ctx[5]);
    			add_location(section, file$7, 31, 2, 777);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(div, t1);
    			append_dev(div, p);
    			p.innerHTML = raw_value;
    			append_dev(section, t2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(31:0) {#each services as { label, text, section }}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let each_1_anchor;
    	let each_value = /*services*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*services*/ 1) {
    				each_value = /*services*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { params = {} } = $$props;
    	let services = getServices();

    	let autoScroll = () => {
    		if (params.service) {
    			let dataSection = document.getElementById(params.service);
    			let headerOffset = 60;

    			if (dataSection) {
    				let dataSectionPos = dataSection.offsetTop;
    				let offsetPosition = dataSectionPos - headerOffset;
    				window.scrollTo({ top: offsetPosition });
    			}
    		} else {
    			window.scrollTo(0, 0);
    		}
    	};

    	beforeUpdate(autoScroll);
    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Services> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("params" in $$props) $$invalidate(1, params = $$props.params);
    	};

    	$$self.$capture_state = () => {
    		return { params, services, autoScroll };
    	};

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(1, params = $$props.params);
    		if ("services" in $$props) $$invalidate(0, services = $$props.services);
    		if ("autoScroll" in $$props) autoScroll = $$props.autoScroll;
    	};

    	return [services, params];
    }

    class Services extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$9, safe_not_equal, { params: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Services",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get params() {
    		throw new Error("<Services>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<Services>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Details\Company\Certifications.svelte generated by Svelte v3.16.7 */

    const file$8 = "src\\Components\\Details\\Company\\Certifications.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (7:4) {#each indexes as index}
    function create_each_block$4(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			if (img.src !== (img_src_value = "images/certifications/ms" + /*index*/ ctx[1] + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "ms" + /*index*/ ctx[1]);
    			attr_dev(img, "class", "image svelte-xlgi1r");
    			add_location(img, file$8, 8, 12, 239);
    			attr_dev(div, "class", "elt svelte-xlgi1r");
    			add_location(div, file$8, 7, 8, 208);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(7:4) {#each indexes as index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let h1;
    	let t1;
    	let div;
    	let each_value = /*indexes*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Nos certifications";
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "title svelte-xlgi1r");
    			add_location(h1, file$8, 4, 0, 94);
    			attr_dev(div, "class", "row centered-elts svelte-xlgi1r");
    			add_location(div, file$8, 5, 0, 137);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*indexes*/ 1) {
    				each_value = /*indexes*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self) {
    	var indexes = Array.from(new Array(12), (val, index) => index + 1);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("indexes" in $$props) $$invalidate(0, indexes = $$props.indexes);
    	};

    	return [indexes];
    }

    class Certifications extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Certifications",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\Components\Details\Company\Skills\DataBI.svelte generated by Svelte v3.16.7 */

    const file$9 = "src\\Components\\Details\\Company\\Skills\\DataBI.svelte";

    function create_fragment$b(ctx) {
    	let h20;
    	let t1;
    	let div0;
    	let p0;
    	let t2;
    	let br0;
    	let t3;
    	let br1;
    	let t4;
    	let br2;
    	let t5;
    	let br3;
    	let t6;
    	let br4;
    	let t7;
    	let br5;
    	let br6;
    	let t8;
    	let br7;
    	let br8;
    	let t9;
    	let em;
    	let t11;
    	let h21;
    	let t13;
    	let div6;
    	let p1;
    	let t14;
    	let br9;
    	let br10;
    	let t15;
    	let br11;
    	let br12;
    	let t16;
    	let t17;
    	let div5;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t18;
    	let t19;
    	let div2;
    	let img1;
    	let img1_src_value;
    	let t20;
    	let t21;
    	let div3;
    	let img2;
    	let img2_src_value;
    	let t22;
    	let t23;
    	let div4;
    	let img3;
    	let img3_src_value;
    	let t24;
    	let t25;
    	let br13;
    	let t26;
    	let h22;
    	let t28;
    	let br14;
    	let t29;
    	let div7;
    	let img4;
    	let img4_src_value;
    	let t30;
    	let br15;
    	let t31;
    	let h23;
    	let t33;
    	let br16;
    	let t34;
    	let div15;
    	let div10;
    	let div8;
    	let p2;
    	let b0;
    	let t36;
    	let br17;
    	let t37;
    	let b1;
    	let t39;
    	let br18;
    	let t40;
    	let i0;
    	let t42;
    	let b2;
    	let t44;
    	let t45;
    	let br19;
    	let t46;
    	let div9;
    	let p3;
    	let t47;
    	let i1;
    	let t49;
    	let br20;
    	let t50;
    	let b3;
    	let t52;
    	let br21;
    	let t53;
    	let b4;
    	let t55;
    	let t56;
    	let div11;
    	let img5;
    	let img5_src_value;
    	let t57;
    	let div14;
    	let div12;
    	let p4;
    	let t58;
    	let b5;
    	let t60;
    	let br22;
    	let t61;
    	let i2;
    	let t63;
    	let b6;
    	let t65;
    	let br23;
    	let t66;
    	let b7;
    	let t68;
    	let i3;
    	let t70;
    	let t71;
    	let br24;
    	let t72;
    	let div13;
    	let p5;
    	let t73;
    	let b8;
    	let t75;
    	let br25;
    	let t76;
    	let b9;
    	let t78;
    	let br26;
    	let t79;
    	let b10;
    	let t81;
    	let t82;
    	let br27;
    	let t83;
    	let div20;
    	let div17;
    	let img6;
    	let img6_src_value;
    	let t84;
    	let h40;
    	let t86;
    	let div16;
    	let img7;
    	let img7_src_value;
    	let t87;
    	let img8;
    	let img8_src_value;
    	let t88;
    	let img9;
    	let img9_src_value;
    	let t89;
    	let p6;
    	let t91;
    	let div19;
    	let img10;
    	let img10_src_value;
    	let t92;
    	let h41;
    	let t94;
    	let div18;
    	let img11;
    	let img11_src_value;
    	let t95;
    	let img12;
    	let img12_src_value;
    	let t96;
    	let img13;
    	let img13_src_value;
    	let t97;
    	let p7;

    	const block = {
    		c: function create() {
    			h20 = element("h2");
    			h20.textContent = "Les enjeux stratégiques de la Data";
    			t1 = space();
    			div0 = element("div");
    			p0 = element("p");
    			t2 = text("La Data et la BI touchent aujourd'hui tous les secteurs d'activité et représente un enjeu majeur pour les entreprises :\r\n        ");
    			br0 = element("br");
    			t3 = text("\r\n        > Mieux comprendre les comportements et les besoins des consommateurs\r\n        ");
    			br1 = element("br");
    			t4 = text("\r\n        > Analyser le trafic web pour développer les ventes\r\n        ");
    			br2 = element("br");
    			t5 = text("\r\n        > Prévenir des ruptures de stocks et favoriser la satisfaction client\r\n        ");
    			br3 = element("br");
    			t6 = text("\r\n        > Croiser la fréquentation des points de ventes avec les campagnes marketing afin d'étudier les impacts\r\n        ");
    			br4 = element("br");
    			t7 = text("\r\n        > Anticiper des problèmes de maintenance et optimiser le SAV\r\n        ");
    			br5 = element("br");
    			br6 = element("br");
    			t8 = text("\r\n        Voici quelques exemples qui démontrent que l'analyse de vos données d'entreprise peut être extrêmement bénéfique pour votre développement.\r\n        ");
    			br7 = element("br");
    			br8 = element("br");
    			t9 = space();
    			em = element("em");
    			em.textContent = "\"Une étude IDC projette que chaque individu génèrera 1,7 Mo d'informations chaque seconde en 2020 et que les pertes des données couteront plus de 30.000 M€ par an aux entreprises françaises\" (Les Echos)";
    			t11 = space();
    			h21 = element("h2");
    			h21.textContent = "La Data et Eliade";
    			t13 = space();
    			div6 = element("div");
    			p1 = element("p");
    			t14 = text("Dans ce contexte, Eliade vous accompagne avec son pôle d'expertise Data/BI, quel que soit le niveau de maturité de votre projet.\r\n        ");
    			br9 = element("br");
    			br10 = element("br");
    			t15 = text("\r\n        Au-delà de la réalisation technique, notre équipe s'adapte à chacune de vos attentes en prenant en compte les contextes fonctionnels et techniques.\r\n        ");
    			br11 = element("br");
    			br12 = element("br");
    			t16 = text("\r\n        Nos compétences vont de la qualification de votre projet jusqu'à la formation de vos équipes.");
    			t17 = space();
    			div5 = element("div");
    			div1 = element("div");
    			img0 = element("img");
    			t18 = text("\r\n            Experts certifiés");
    			t19 = space();
    			div2 = element("div");
    			img1 = element("img");
    			t20 = text("\r\n            Proximité régionale");
    			t21 = space();
    			div3 = element("div");
    			img2 = element("img");
    			t22 = text("\r\n            Adaptabilité à toute épreuve");
    			t23 = space();
    			div4 = element("div");
    			img3 = element("img");
    			t24 = text("\r\n            Flexibilité maximale");
    			t25 = space();
    			br13 = element("br");
    			t26 = space();
    			h22 = element("h2");
    			h22.textContent = "La touch Eliade : une démarche sur-mesure";
    			t28 = space();
    			br14 = element("br");
    			t29 = text(">\r\n");
    			div7 = element("div");
    			img4 = element("img");
    			t30 = space();
    			br15 = element("br");
    			t31 = space();
    			h23 = element("h2");
    			h23.textContent = "Notre approche technique";
    			t33 = space();
    			br16 = element("br");
    			t34 = space();
    			div15 = element("div");
    			div10 = element("div");
    			div8 = element("div");
    			p2 = element("p");
    			b0 = element("b");
    			b0.textContent = "L'identification des fournisseurs de données";
    			t36 = text(" au sein et en dehors du S.I. est une priorité.");
    			br17 = element("br");
    			t37 = text("La hiérarchisation des sources permet ensuite de mettre en place votre système d'analyse et de capitalisation ");
    			b1 = element("b");
    			b1.textContent = "progressivement";
    			t39 = text(".");
    			br18 = element("br");
    			t40 = text("Mais aussi : avec ");
    			i0 = element("i");
    			i0.textContent = "Microsoft Azure";
    			t42 = text(", profitez d'une montée en charge progressive et d'un ");
    			b2 = element("b");
    			b2.textContent = "investissement maitrisé";
    			t44 = text(".");
    			t45 = space();
    			br19 = element("br");
    			t46 = space();
    			div9 = element("div");
    			p3 = element("p");
    			t47 = text("Nous utilisons les derniers outils pour analyser vos indicateurs, comme ");
    			i1 = element("i");
    			i1.textContent = "Microsoft Power BI";
    			t49 = text(".");
    			br20 = element("br");
    			t50 = text("Ainsi, vos tableaux de bord sont disponibles depuis n'importe où, sur ");
    			b3 = element("b");
    			b3.textContent = "tous vos supports";
    			t52 = text(".");
    			br21 = element("br");
    			t53 = text("Mais aussi : Vous disposez de la vision détaillée de vos données en naviguant ");
    			b4 = element("b");
    			b4.textContent = "simplement";
    			t55 = text(" depuis les tableaux de bord.");
    			t56 = space();
    			div11 = element("div");
    			img5 = element("img");
    			t57 = space();
    			div14 = element("div");
    			div12 = element("div");
    			p4 = element("p");
    			t58 = text("Pouvoir centraliser et ");
    			b5 = element("b");
    			b5.textContent = "multiplexer";
    			t60 = text(" des données de fournisseurs multiples est un préalable indispensable à toute exploitation.");
    			br22 = element("br");
    			t61 = text("Avec ");
    			i2 = element("i");
    			i2.textContent = "Azure Data Factory";
    			t63 = text(", nous collectons l'information à sa source et la ");
    			b6 = element("b");
    			b6.textContent = "sécurisons";
    			t65 = text(" au cœur de votre entrepôt de données.");
    			br23 = element("br");
    			t66 = text("Mais aussi : nos équipes ont développé des ");
    			b7 = element("b");
    			b7.textContent = "composants additionnels";
    			t68 = text(" permettant de sécuriser et transformer vos données lors de leur transfert vers le ");
    			i3 = element("i");
    			i3.textContent = "cloud";
    			t70 = text(".");
    			t71 = space();
    			br24 = element("br");
    			t72 = space();
    			div13 = element("div");
    			p5 = element("p");
    			t73 = text("Il est indispensable de ");
    			b8 = element("b");
    			b8.textContent = "maintenir vos applications";
    			t75 = text(" au maximum de leurs capacités.");
    			br25 = element("br");
    			t76 = text("Tous nos scénarios incluent un plan d'optimisation, en ");
    			b9 = element("b");
    			b9.textContent = "collaboration avec vous";
    			t78 = text(" ou en autonomie.");
    			br26 = element("br");
    			t79 = text("Mais aussi : avec l'accroissement des sources et du volume des données à manipuler, nous déclinons également les scénarios en les axant sur les spécificités d'un ");
    			b10 = element("b");
    			b10.textContent = "data lake";
    			t81 = text(".");
    			t82 = space();
    			br27 = element("br");
    			t83 = space();
    			div20 = element("div");
    			div17 = element("div");
    			img6 = element("img");
    			t84 = space();
    			h40 = element("h4");
    			h40.textContent = "Thomas";
    			t86 = space();
    			div16 = element("div");
    			img7 = element("img");
    			t87 = space();
    			img8 = element("img");
    			t88 = space();
    			img9 = element("img");
    			t89 = space();
    			p6 = element("p");
    			p6.textContent = "Plongé dans SQL Server depuis 2001, j'ai pu me frotter aux écueils de l'administration et du tuning avant d'aborder les scénarios de Business Intelligence. L'évolution du marché m'a conduit vers le cloud et ses capacités exponentielles.";
    			t91 = space();
    			div19 = element("div");
    			img10 = element("img");
    			t92 = space();
    			h41 = element("h4");
    			h41.textContent = "Julien";
    			t94 = space();
    			div18 = element("div");
    			img11 = element("img");
    			t95 = space();
    			img12 = element("img");
    			t96 = space();
    			img13 = element("img");
    			t97 = space();
    			p7 = element("p");
    			p7.textContent = "Développeur .Net/C# depuis 2014, mon parcours professionnel m'a conduit à me spécialiser vers les technologies du Cloud avec Azure. Depuis fin 2016, je mets à profit mes compétences techniques au sein de la cellule Data et Développement d'Eliade afin d'accompagner la transition de nos clients vers le cloud.";
    			attr_dev(h20, "class", "description svelte-1hjuwzq");
    			add_location(h20, file$9, 0, 0, 0);
    			add_location(br0, file$9, 4, 8, 238);
    			add_location(br1, file$9, 6, 8, 331);
    			add_location(br2, file$9, 8, 8, 406);
    			add_location(br3, file$9, 10, 8, 499);
    			add_location(br4, file$9, 12, 8, 626);
    			add_location(br5, file$9, 14, 8, 710);
    			add_location(br6, file$9, 14, 12, 714);
    			add_location(br7, file$9, 16, 8, 876);
    			add_location(br8, file$9, 16, 12, 880);
    			attr_dev(em, "class", "svelte-1hjuwzq");
    			add_location(em, file$9, 17, 8, 894);
    			attr_dev(p0, "class", "description svelte-1hjuwzq");
    			add_location(p0, file$9, 2, 4, 76);
    			add_location(div0, file$9, 1, 0, 65);
    			attr_dev(h21, "class", "description svelte-1hjuwzq");
    			add_location(h21, file$9, 20, 0, 1125);
    			add_location(br9, file$9, 24, 8, 1382);
    			add_location(br10, file$9, 24, 12, 1386);
    			add_location(br11, file$9, 26, 8, 1557);
    			add_location(br12, file$9, 26, 12, 1561);
    			attr_dev(p1, "class", "col-left svelte-1hjuwzq");
    			add_location(p1, file$9, 22, 4, 1214);
    			if (img0.src !== (img0_src_value = "images/skills/Expert.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Experts certifiés");
    			set_style(img0, "width", "100%");
    			add_location(img0, file$9, 31, 12, 1755);
    			attr_dev(div1, "class", "thumbnails svelte-1hjuwzq");
    			add_location(div1, file$9, 30, 8, 1717);
    			if (img1.src !== (img1_src_value = "images/skills/Proximity.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Proximité régionale");
    			set_style(img1, "width", "100%");
    			add_location(img1, file$9, 35, 12, 1929);
    			attr_dev(div2, "class", "thumbnails svelte-1hjuwzq");
    			add_location(div2, file$9, 34, 8, 1891);
    			if (img2.src !== (img2_src_value = "images/skills/Adaptability.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Adaptabilité à toute épreuve");
    			set_style(img2, "width", "100%");
    			add_location(img2, file$9, 39, 12, 2110);
    			attr_dev(div3, "class", "thumbnails svelte-1hjuwzq");
    			add_location(div3, file$9, 38, 8, 2072);
    			if (img3.src !== (img3_src_value = "images/skills/flexibility.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Flexibilité maximale");
    			set_style(img3, "width", "100%");
    			add_location(img3, file$9, 43, 12, 2312);
    			attr_dev(div4, "class", "thumbnails svelte-1hjuwzq");
    			add_location(div4, file$9, 42, 8, 2274);
    			attr_dev(div5, "class", "col-right svelte-1hjuwzq");
    			add_location(div5, file$9, 29, 4, 1684);
    			attr_dev(div6, "class", "description-container svelte-1hjuwzq");
    			add_location(div6, file$9, 21, 0, 1173);
    			add_location(br13, file$9, 48, 0, 2471);
    			attr_dev(h22, "class", "description svelte-1hjuwzq");
    			add_location(h22, file$9, 49, 0, 2477);
    			add_location(br14, file$9, 50, 0, 2549);
    			if (img4.src !== (img4_src_value = "images/skills/dataBI.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Data/BI schema");
    			set_style(img4, "width", "100%");
    			add_location(img4, file$9, 52, 4, 2587);
    			attr_dev(div7, "class", "description svelte-1hjuwzq");
    			add_location(div7, file$9, 51, 0, 2556);
    			add_location(br15, file$9, 54, 0, 2673);
    			attr_dev(h23, "class", "description svelte-1hjuwzq");
    			add_location(h23, file$9, 55, 0, 2679);
    			add_location(br16, file$9, 56, 0, 2734);
    			add_location(b0, file$9, 60, 15, 2839);
    			add_location(br17, file$9, 60, 113, 2937);
    			add_location(b1, file$9, 60, 227, 3051);
    			add_location(br18, file$9, 60, 250, 3074);
    			add_location(i0, file$9, 60, 272, 3096);
    			add_location(b2, file$9, 60, 348, 3172);
    			attr_dev(p2, "class", "svelte-1hjuwzq");
    			add_location(p2, file$9, 60, 12, 2836);
    			attr_dev(div8, "class", "col svelte-1hjuwzq");
    			add_location(div8, file$9, 59, 8, 2805);
    			add_location(br19, file$9, 62, 8, 3233);
    			add_location(i1, file$9, 64, 87, 3353);
    			add_location(br20, file$9, 64, 113, 3379);
    			add_location(b3, file$9, 64, 187, 3453);
    			add_location(br21, file$9, 64, 212, 3478);
    			add_location(b4, file$9, 64, 294, 3560);
    			attr_dev(p3, "class", "svelte-1hjuwzq");
    			add_location(p3, file$9, 64, 12, 3278);
    			attr_dev(div9, "class", "col svelte-1hjuwzq");
    			add_location(div9, file$9, 63, 8, 3247);
    			attr_dev(div10, "class", "col-1-3 svelte-1hjuwzq");
    			add_location(div10, file$9, 58, 4, 2774);
    			if (img5.src !== (img5_src_value = "images/skills/circle-dataBI.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "Circle Data/BI");
    			set_style(img5, "width", "100%");
    			add_location(img5, file$9, 68, 8, 3675);
    			attr_dev(div11, "class", "col-2-3 svelte-1hjuwzq");
    			add_location(div11, file$9, 67, 4, 3644);
    			add_location(b5, file$9, 72, 38, 3864);
    			add_location(br22, file$9, 72, 147, 3973);
    			add_location(i2, file$9, 72, 156, 3982);
    			add_location(b6, file$9, 72, 231, 4057);
    			add_location(br23, file$9, 72, 286, 4112);
    			add_location(b7, file$9, 72, 333, 4159);
    			add_location(i3, file$9, 72, 446, 4272);
    			attr_dev(p4, "class", "svelte-1hjuwzq");
    			add_location(p4, file$9, 72, 12, 3838);
    			attr_dev(div12, "class", "col svelte-1hjuwzq");
    			add_location(div12, file$9, 71, 8, 3807);
    			add_location(br24, file$9, 74, 8, 4315);
    			add_location(b8, file$9, 76, 39, 4387);
    			add_location(br25, file$9, 76, 103, 4451);
    			add_location(b9, file$9, 76, 162, 4510);
    			add_location(br26, file$9, 76, 209, 4557);
    			add_location(b10, file$9, 76, 375, 4723);
    			attr_dev(p5, "class", "svelte-1hjuwzq");
    			add_location(p5, file$9, 76, 12, 4360);
    			attr_dev(div13, "class", "col svelte-1hjuwzq");
    			add_location(div13, file$9, 75, 8, 4329);
    			attr_dev(div14, "class", "col-3-3 svelte-1hjuwzq");
    			add_location(div14, file$9, 70, 4, 3776);
    			attr_dev(div15, "class", "flex-container svelte-1hjuwzq");
    			add_location(div15, file$9, 57, 0, 2740);
    			add_location(br27, file$9, 80, 0, 4782);
    			if (img6.src !== (img6_src_value = "images/skills/tom.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "tom");
    			set_style(img6, "width", "25%");
    			add_location(img6, file$9, 83, 8, 4853);
    			attr_dev(h40, "class", "svelte-1hjuwzq");
    			add_location(h40, file$9, 84, 8, 4924);
    			if (img7.src !== (img7_src_value = "images/skills/MCSA_BI.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "MCSA_BI");
    			set_style(img7, "width", "33.33%");
    			add_location(img7, file$9, 86, 12, 4991);
    			if (img8.src !== (img8_src_value = "images/skills/MCSA_SQL.png")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "MCSA_SQL");
    			set_style(img8, "width", "33.33%");
    			add_location(img8, file$9, 87, 12, 5077);
    			if (img9.src !== (img9_src_value = "images/skills/MCSE_DATA.png")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "alt", "MCSE_DATA");
    			set_style(img9, "width", "33.33%");
    			add_location(img9, file$9, 88, 12, 5165);
    			attr_dev(div16, "class", "certifications svelte-1hjuwzq");
    			add_location(div16, file$9, 85, 8, 4949);
    			attr_dev(p6, "class", "desc-profile svelte-1hjuwzq");
    			add_location(p6, file$9, 90, 8, 5267);
    			attr_dev(div17, "class", "profile svelte-1hjuwzq");
    			add_location(div17, file$9, 82, 4, 4822);
    			if (img10.src !== (img10_src_value = "images/skills/julien.png")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "alt", "julien");
    			set_style(img10, "width", "25%");
    			add_location(img10, file$9, 95, 8, 5604);
    			attr_dev(h41, "class", "svelte-1hjuwzq");
    			add_location(h41, file$9, 96, 8, 5681);
    			if (img11.src !== (img11_src_value = "images/skills/EXAM_AZURESOLUTION.png")) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "alt", "EXAM_AZURESOLUTION");
    			set_style(img11, "width", "33.33%");
    			add_location(img11, file$9, 98, 12, 5748);
    			if (img12.src !== (img12_src_value = "images/skills/EXAM_CLOUD.png")) attr_dev(img12, "src", img12_src_value);
    			attr_dev(img12, "alt", "EXAM_CLOUD");
    			set_style(img12, "width", "33.33%");
    			add_location(img12, file$9, 99, 12, 5856);
    			if (img13.src !== (img13_src_value = "images/skills/EXAM_SHAREPOINT.png")) attr_dev(img13, "src", img13_src_value);
    			attr_dev(img13, "alt", "EXAM_SHAREPOINT");
    			set_style(img13, "width", "33.33%");
    			add_location(img13, file$9, 100, 12, 5948);
    			attr_dev(div18, "class", "certifications svelte-1hjuwzq");
    			add_location(div18, file$9, 97, 8, 5706);
    			attr_dev(p7, "class", "desc-profile svelte-1hjuwzq");
    			add_location(p7, file$9, 102, 8, 6062);
    			attr_dev(div19, "class", "profile svelte-1hjuwzq");
    			add_location(div19, file$9, 94, 4, 5573);
    			attr_dev(div20, "class", "flex-container svelte-1hjuwzq");
    			add_location(div20, file$9, 81, 0, 4788);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h20, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, p0);
    			append_dev(p0, t2);
    			append_dev(p0, br0);
    			append_dev(p0, t3);
    			append_dev(p0, br1);
    			append_dev(p0, t4);
    			append_dev(p0, br2);
    			append_dev(p0, t5);
    			append_dev(p0, br3);
    			append_dev(p0, t6);
    			append_dev(p0, br4);
    			append_dev(p0, t7);
    			append_dev(p0, br5);
    			append_dev(p0, br6);
    			append_dev(p0, t8);
    			append_dev(p0, br7);
    			append_dev(p0, br8);
    			append_dev(p0, t9);
    			append_dev(p0, em);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, h21, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, p1);
    			append_dev(p1, t14);
    			append_dev(p1, br9);
    			append_dev(p1, br10);
    			append_dev(p1, t15);
    			append_dev(p1, br11);
    			append_dev(p1, br12);
    			append_dev(p1, t16);
    			append_dev(div6, t17);
    			append_dev(div6, div5);
    			append_dev(div5, div1);
    			append_dev(div1, img0);
    			append_dev(div1, t18);
    			append_dev(div5, t19);
    			append_dev(div5, div2);
    			append_dev(div2, img1);
    			append_dev(div2, t20);
    			append_dev(div5, t21);
    			append_dev(div5, div3);
    			append_dev(div3, img2);
    			append_dev(div3, t22);
    			append_dev(div5, t23);
    			append_dev(div5, div4);
    			append_dev(div4, img3);
    			append_dev(div4, t24);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, br13, anchor);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, h22, anchor);
    			insert_dev(target, t28, anchor);
    			insert_dev(target, br14, anchor);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, img4);
    			insert_dev(target, t30, anchor);
    			insert_dev(target, br15, anchor);
    			insert_dev(target, t31, anchor);
    			insert_dev(target, h23, anchor);
    			insert_dev(target, t33, anchor);
    			insert_dev(target, br16, anchor);
    			insert_dev(target, t34, anchor);
    			insert_dev(target, div15, anchor);
    			append_dev(div15, div10);
    			append_dev(div10, div8);
    			append_dev(div8, p2);
    			append_dev(p2, b0);
    			append_dev(p2, t36);
    			append_dev(p2, br17);
    			append_dev(p2, t37);
    			append_dev(p2, b1);
    			append_dev(p2, t39);
    			append_dev(p2, br18);
    			append_dev(p2, t40);
    			append_dev(p2, i0);
    			append_dev(p2, t42);
    			append_dev(p2, b2);
    			append_dev(p2, t44);
    			append_dev(div10, t45);
    			append_dev(div10, br19);
    			append_dev(div10, t46);
    			append_dev(div10, div9);
    			append_dev(div9, p3);
    			append_dev(p3, t47);
    			append_dev(p3, i1);
    			append_dev(p3, t49);
    			append_dev(p3, br20);
    			append_dev(p3, t50);
    			append_dev(p3, b3);
    			append_dev(p3, t52);
    			append_dev(p3, br21);
    			append_dev(p3, t53);
    			append_dev(p3, b4);
    			append_dev(p3, t55);
    			append_dev(div15, t56);
    			append_dev(div15, div11);
    			append_dev(div11, img5);
    			append_dev(div15, t57);
    			append_dev(div15, div14);
    			append_dev(div14, div12);
    			append_dev(div12, p4);
    			append_dev(p4, t58);
    			append_dev(p4, b5);
    			append_dev(p4, t60);
    			append_dev(p4, br22);
    			append_dev(p4, t61);
    			append_dev(p4, i2);
    			append_dev(p4, t63);
    			append_dev(p4, b6);
    			append_dev(p4, t65);
    			append_dev(p4, br23);
    			append_dev(p4, t66);
    			append_dev(p4, b7);
    			append_dev(p4, t68);
    			append_dev(p4, i3);
    			append_dev(p4, t70);
    			append_dev(div14, t71);
    			append_dev(div14, br24);
    			append_dev(div14, t72);
    			append_dev(div14, div13);
    			append_dev(div13, p5);
    			append_dev(p5, t73);
    			append_dev(p5, b8);
    			append_dev(p5, t75);
    			append_dev(p5, br25);
    			append_dev(p5, t76);
    			append_dev(p5, b9);
    			append_dev(p5, t78);
    			append_dev(p5, br26);
    			append_dev(p5, t79);
    			append_dev(p5, b10);
    			append_dev(p5, t81);
    			insert_dev(target, t82, anchor);
    			insert_dev(target, br27, anchor);
    			insert_dev(target, t83, anchor);
    			insert_dev(target, div20, anchor);
    			append_dev(div20, div17);
    			append_dev(div17, img6);
    			append_dev(div17, t84);
    			append_dev(div17, h40);
    			append_dev(div17, t86);
    			append_dev(div17, div16);
    			append_dev(div16, img7);
    			append_dev(div16, t87);
    			append_dev(div16, img8);
    			append_dev(div16, t88);
    			append_dev(div16, img9);
    			append_dev(div17, t89);
    			append_dev(div17, p6);
    			append_dev(div20, t91);
    			append_dev(div20, div19);
    			append_dev(div19, img10);
    			append_dev(div19, t92);
    			append_dev(div19, h41);
    			append_dev(div19, t94);
    			append_dev(div19, div18);
    			append_dev(div18, img11);
    			append_dev(div18, t95);
    			append_dev(div18, img12);
    			append_dev(div18, t96);
    			append_dev(div18, img13);
    			append_dev(div19, t97);
    			append_dev(div19, p7);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h20);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(h21);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(br13);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(h22);
    			if (detaching) detach_dev(t28);
    			if (detaching) detach_dev(br14);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t30);
    			if (detaching) detach_dev(br15);
    			if (detaching) detach_dev(t31);
    			if (detaching) detach_dev(h23);
    			if (detaching) detach_dev(t33);
    			if (detaching) detach_dev(br16);
    			if (detaching) detach_dev(t34);
    			if (detaching) detach_dev(div15);
    			if (detaching) detach_dev(t82);
    			if (detaching) detach_dev(br27);
    			if (detaching) detach_dev(t83);
    			if (detaching) detach_dev(div20);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class DataBI extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DataBI",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\Components\Details\Company\Skills.svelte generated by Svelte v3.16.7 */
    const file$a = "src\\Components\\Details\\Company\\Skills.svelte";

    function create_fragment$c(ctx) {
    	let div;
    	let h10;
    	let t1;
    	let h11;
    	let t3;
    	let t4;
    	let br0;
    	let t5;
    	let h12;
    	let t7;
    	let br1;
    	let t8;
    	let h13;
    	let current;
    	const databi = new DataBI({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			h10 = element("h1");
    			h10.textContent = "Pôles de compétences";
    			t1 = space();
    			h11 = element("h1");
    			h11.textContent = "Data/BI";
    			t3 = space();
    			create_component(databi.$$.fragment);
    			t4 = space();
    			br0 = element("br");
    			t5 = space();
    			h12 = element("h1");
    			h12.textContent = "Infrastructure/Identité/Communication";
    			t7 = space();
    			br1 = element("br");
    			t8 = space();
    			h13 = element("h1");
    			h13.textContent = "Solutions collaboratives";
    			attr_dev(h10, "class", "title svelte-cjzokk");
    			add_location(h10, file$a, 7, 2, 140);
    			attr_dev(h11, "class", "subtitle svelte-cjzokk");
    			add_location(h11, file$a, 8, 2, 187);
    			add_location(br0, file$a, 10, 2, 238);
    			attr_dev(h12, "class", "subtitle svelte-cjzokk");
    			add_location(h12, file$a, 11, 2, 246);
    			add_location(br1, file$a, 12, 2, 313);
    			attr_dev(h13, "class", "subtitle svelte-cjzokk");
    			add_location(h13, file$a, 13, 2, 321);
    			attr_dev(div, "class", "section grey-bgcolor");
    			add_location(div, file$a, 6, 0, 102);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h10);
    			append_dev(div, t1);
    			append_dev(div, h11);
    			append_dev(div, t3);
    			mount_component(databi, div, null);
    			append_dev(div, t4);
    			append_dev(div, br0);
    			append_dev(div, t5);
    			append_dev(div, h12);
    			append_dev(div, t7);
    			append_dev(div, br1);
    			append_dev(div, t8);
    			append_dev(div, h13);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(databi.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(databi.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(databi);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self) {
    	window.scrollTo(0, 0);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		
    	};

    	return [];
    }

    class Skills extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Skills",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\Components\Details\Company\Collapsible.svelte generated by Svelte v3.16.7 */

    const file$b = "src\\Components\\Details\\Company\\Collapsible.svelte";

    function create_fragment$d(ctx) {
    	let button;
    	let h3;
    	let t0_value = /*offer*/ ctx[0].title + "";
    	let t0;
    	let t1;
    	let div;
    	let h40;
    	let t3;
    	let p0;
    	let t5;
    	let ul0;
    	let li0;
    	let t7;
    	let li1;
    	let t9;
    	let li2;
    	let t11;
    	let h41;
    	let t13;
    	let p1;
    	let t14;
    	let br0;
    	let t15;
    	let t16;
    	let ul1;
    	let li3;
    	let t18;
    	let li4;
    	let t20;
    	let li5;
    	let t22;
    	let li6;
    	let t24;
    	let p2;
    	let t26;
    	let h42;
    	let t28;
    	let ul2;
    	let li7;
    	let t30;
    	let li8;
    	let t32;
    	let li9;
    	let t34;
    	let li10;
    	let t36;
    	let li11;
    	let t38;
    	let p3;
    	let t39;
    	let br1;
    	let br2;
    	let t40;
    	let t41;
    	let h43;
    	let t43;
    	let ul3;
    	let li12;
    	let t45;
    	let li13;
    	let t47;
    	let li14;
    	let t49;
    	let li15;
    	let t51;
    	let h44;
    	let t53;
    	let h6;
    	let t55;
    	let p4;
    	let t56;
    	let br3;
    	let t57;
    	let br4;
    	let t58;
    	let div_id_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			div = element("div");
    			h40 = element("h4");
    			h40.textContent = "Qui sommes nous ?";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "Créée en 2001, Eliade est une société de services experte des solutions Microsoft, qui se place aujourd’hui comme un acteur incontournable dans la région des Hauts de France. En véritable apporteurs de solutions, nous accompagnons nos clients dans leur transformation digitale et prêtons une attention toute particulière au sens et à la qualité du service.";
    			t5 = text("\r\n    Société à taille humaine, nos consultants certifiés Microsoft accompagnent nos clients sur leurs domaines d’expertise :\r\n    ");
    			ul0 = element("ul");
    			li0 = element("li");
    			li0.textContent = "Solutions collaboratives Microsoft";
    			t7 = space();
    			li1 = element("li");
    			li1.textContent = "Identité / Infrastructure Onprem-Cloud / Communication / Sécurité";
    			t9 = space();
    			li2 = element("li");
    			li2.textContent = "Data / BI / Développement .NET";
    			t11 = space();
    			h41 = element("h4");
    			h41.textContent = "Quelle opportunité ?";
    			t13 = space();
    			p1 = element("p");
    			t14 = text("Nous nous développons, et pour cela, nous avons besoin de vous !");
    			br0 = element("br");
    			t15 = text("Rattaché(e) au Directeur Technique, Yann, vous aurez pour mission de prendre en charge les demandes d'incidents de nos clients au sein de notre équipe Manageo.");
    			t16 = text("\r\n    Vous ferez face à des challenges techniques et interviendrez sur les thématiques suivantes :\r\n    ");
    			ul1 = element("ul");
    			li3 = element("li");
    			li3.textContent = "Qualification et traitement les incidents déclarés par nos clients (niveau 2/3)";
    			t18 = space();
    			li4 = element("li");
    			li4.textContent = "Suivi de l'incident jusqu'à la résolution par vos soins ou avec l'aide des Consultants d'Eliade si escalade";
    			t20 = space();
    			li5 = element("li");
    			li5.textContent = "Suivi des contrats de support (évolution de la consommation, date d'échéance, interlocuteurs...)";
    			t22 = space();
    			li6 = element("li");
    			li6.textContent = "Intervention sur site si la situation l'exige";
    			t24 = space();
    			p2 = element("p");
    			p2.textContent = "Vous serez également amené(e) à accompagner les consultants d'Eliade afin de suivre les prestations d'intégration et monter en compétences sur les solutions Microsoft.";
    			t26 = space();
    			h42 = element("h4");
    			h42.textContent = "Vous souhaitez nous rejoindre ?";
    			t28 = text("\r\n    Vous ...\r\n    ");
    			ul2 = element("ul");
    			li7 = element("li");
    			li7.textContent = "Êtes issu(e) d’une formation bac +2/+3 ?";
    			t30 = space();
    			li8 = element("li");
    			li8.textContent = "Possédez une expérience de minimum 1 an sur un poste similaire ?";
    			t32 = space();
    			li9 = element("li");
    			li9.textContent = "Avez déjà appréhendé les technos suivantes : Office 365, Azure, AD, Exchange… ?";
    			t34 = space();
    			li10 = element("li");
    			li10.textContent = "Êtes force de proposition, enthousiaste et passionné par le monde de l’IT ?";
    			t36 = space();
    			li11 = element("li");
    			li11.textContent = "Et surtout, vous avez la volonté de monter en compétence, de travailler dans une équipe soudée, où la proximité et l'écoute sont les maîtres-mots du quotidien ?";
    			t38 = space();
    			p3 = element("p");
    			t39 = text("Alors rejoignez-nous !");
    			br1 = element("br");
    			br2 = element("br");
    			t40 = text("Petit bonus : Sportif(ve) ? Nos collaborateurs seront heureux de vous intégrer dans leurs programmes d’entrainement !");
    			t41 = space();
    			h43 = element("h4");
    			h43.textContent = "Quels avantages ?";
    			t43 = space();
    			ul3 = element("ul");
    			li12 = element("li");
    			li12.textContent = "Ordinateur portable, abonnement Office 365 E5 avec téléphonie Teams et souscription Azure";
    			t45 = space();
    			li13 = element("li");
    			li13.textContent = "Prise en charge des certifications Microsoft (voucher et préparation)";
    			t47 = space();
    			li14 = element("li");
    			li14.textContent = "Mutuelle familiale";
    			t49 = space();
    			li15 = element("li");
    			li15.textContent = "Tickets restaurants";
    			t51 = space();
    			h44 = element("h4");
    			h44.textContent = "C'est quoi la suite ?";
    			t53 = space();
    			h6 = element("h6");
    			h6.textContent = "Vous êtes intéressé(e) ? Nous aussi !";
    			t55 = space();
    			p4 = element("p");
    			t56 = text("Le processus de recrutement chez Eliade inclut l’ensemble des collaborateurs.");
    			br3 = element("br");
    			t57 = text("En plus de réunir un panel d’experts, nous estimons que la cohésion d’équipe importe tout autant que le savoir-faire technique.");
    			br4 = element("br");
    			t58 = text("À la suite d’un premier entretien téléphonique, vous serez amené(e) à rencontrer vos futur(e)s collègues pour échanger autour de vos domaines de compétences, votre expérience et vos autres passions.");
    			add_location(h3, file$b, 17, 62, 442);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "collapsible svelte-zldnbv");
    			add_location(button, file$b, 17, 0, 380);
    			add_location(h40, file$b, 19, 4, 547);
    			add_location(p0, file$b, 20, 4, 579);
    			add_location(li0, file$b, 23, 8, 1087);
    			add_location(li1, file$b, 24, 8, 1140);
    			add_location(li2, file$b, 25, 8, 1224);
    			add_location(ul0, file$b, 22, 4, 1073);
    			add_location(h41, file$b, 28, 4, 1282);
    			add_location(br0, file$b, 29, 71, 1384);
    			add_location(p1, file$b, 29, 4, 1317);
    			add_location(li3, file$b, 32, 8, 1669);
    			add_location(li4, file$b, 33, 8, 1767);
    			add_location(li5, file$b, 34, 8, 1893);
    			add_location(li6, file$b, 35, 8, 2008);
    			add_location(ul1, file$b, 31, 4, 1655);
    			add_location(p2, file$b, 37, 4, 2079);
    			add_location(h42, file$b, 39, 4, 2265);
    			add_location(li7, file$b, 42, 8, 2339);
    			add_location(li8, file$b, 43, 8, 2404);
    			add_location(li9, file$b, 44, 8, 2487);
    			add_location(li10, file$b, 45, 8, 2585);
    			add_location(li11, file$b, 46, 8, 2685);
    			add_location(ul2, file$b, 41, 4, 2325);
    			add_location(br1, file$b, 48, 29, 2896);
    			add_location(br2, file$b, 48, 33, 2900);
    			add_location(p3, file$b, 48, 4, 2871);
    			add_location(h43, file$b, 50, 4, 3037);
    			add_location(li12, file$b, 52, 8, 3083);
    			add_location(li13, file$b, 53, 8, 3191);
    			add_location(li14, file$b, 54, 8, 3279);
    			add_location(li15, file$b, 55, 8, 3316);
    			add_location(ul3, file$b, 51, 4, 3069);
    			add_location(h44, file$b, 58, 4, 3367);
    			add_location(h6, file$b, 59, 4, 3403);
    			add_location(br3, file$b, 60, 84, 3535);
    			add_location(br4, file$b, 60, 215, 3666);
    			add_location(p4, file$b, 60, 4, 3455);
    			attr_dev(div, "id", div_id_value = "content" + /*offer*/ ctx[0].id);
    			attr_dev(div, "class", "content svelte-zldnbv");
    			set_style(div, "display", "none");
    			add_location(div, file$b, 18, 0, 475);
    			dispose = listen_dev(button, "click", /*collapse*/ ctx[1], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, h3);
    			append_dev(h3, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, h40);
    			append_dev(div, t3);
    			append_dev(div, p0);
    			append_dev(div, t5);
    			append_dev(div, ul0);
    			append_dev(ul0, li0);
    			append_dev(ul0, t7);
    			append_dev(ul0, li1);
    			append_dev(ul0, t9);
    			append_dev(ul0, li2);
    			append_dev(div, t11);
    			append_dev(div, h41);
    			append_dev(div, t13);
    			append_dev(div, p1);
    			append_dev(p1, t14);
    			append_dev(p1, br0);
    			append_dev(p1, t15);
    			append_dev(div, t16);
    			append_dev(div, ul1);
    			append_dev(ul1, li3);
    			append_dev(ul1, t18);
    			append_dev(ul1, li4);
    			append_dev(ul1, t20);
    			append_dev(ul1, li5);
    			append_dev(ul1, t22);
    			append_dev(ul1, li6);
    			append_dev(div, t24);
    			append_dev(div, p2);
    			append_dev(div, t26);
    			append_dev(div, h42);
    			append_dev(div, t28);
    			append_dev(div, ul2);
    			append_dev(ul2, li7);
    			append_dev(ul2, t30);
    			append_dev(ul2, li8);
    			append_dev(ul2, t32);
    			append_dev(ul2, li9);
    			append_dev(ul2, t34);
    			append_dev(ul2, li10);
    			append_dev(ul2, t36);
    			append_dev(ul2, li11);
    			append_dev(div, t38);
    			append_dev(div, p3);
    			append_dev(p3, t39);
    			append_dev(p3, br1);
    			append_dev(p3, br2);
    			append_dev(p3, t40);
    			append_dev(div, t41);
    			append_dev(div, h43);
    			append_dev(div, t43);
    			append_dev(div, ul3);
    			append_dev(ul3, li12);
    			append_dev(ul3, t45);
    			append_dev(ul3, li13);
    			append_dev(ul3, t47);
    			append_dev(ul3, li14);
    			append_dev(ul3, t49);
    			append_dev(ul3, li15);
    			append_dev(div, t51);
    			append_dev(div, h44);
    			append_dev(div, t53);
    			append_dev(div, h6);
    			append_dev(div, t55);
    			append_dev(div, p4);
    			append_dev(p4, t56);
    			append_dev(p4, br3);
    			append_dev(p4, t57);
    			append_dev(p4, br4);
    			append_dev(p4, t58);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*offer*/ 1 && t0_value !== (t0_value = /*offer*/ ctx[0].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*offer*/ 1 && div_id_value !== (div_id_value = "content" + /*offer*/ ctx[0].id)) {
    				attr_dev(div, "id", div_id_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { offer = { title: "", description: "", id: 1 } } = $$props;

    	let collapse = () => {
    		let content = document.getElementById("content" + offer.id);

    		if (content.style.display === "none") {
    			content.style.display = "block";
    		} else {
    			content.style.display = "none";
    		}
    	};

    	const writable_props = ["offer"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Collapsible> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("offer" in $$props) $$invalidate(0, offer = $$props.offer);
    	};

    	$$self.$capture_state = () => {
    		return { offer, collapse };
    	};

    	$$self.$inject_state = $$props => {
    		if ("offer" in $$props) $$invalidate(0, offer = $$props.offer);
    		if ("collapse" in $$props) $$invalidate(1, collapse = $$props.collapse);
    	};

    	return [offer, collapse];
    }

    class Collapsible extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$d, safe_not_equal, { offer: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Collapsible",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get offer() {
    		throw new Error("<Collapsible>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offer(value) {
    		throw new Error("<Collapsible>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Details\Company\Recruiting.svelte generated by Svelte v3.16.7 */
    const file$c = "src\\Components\\Details\\Company\\Recruiting.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (23:4) {#each hiringOffers as offer}
    function create_each_block$5(ctx) {
    	let current;

    	const collapsible = new Collapsible({
    			props: { offer: /*offer*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(collapsible.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(collapsible, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(collapsible.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(collapsible.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(collapsible, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(23:4) {#each hiringOffers as offer}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let h1;
    	let t1;
    	let div;
    	let t2;
    	let form;
    	let h4;
    	let t4;
    	let input0;
    	let br0;
    	let br1;
    	let t5;
    	let input1;
    	let t6;
    	let p;
    	let current;
    	let each_value = /*hiringOffers*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Nos offres d'emploi";
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			form = element("form");
    			h4 = element("h4");
    			h4.textContent = "Créer une nouvelle offre";
    			t4 = space();
    			input0 = element("input");
    			br0 = element("br");
    			br1 = element("br");
    			t5 = space();
    			input1 = element("input");
    			t6 = space();
    			p = element("p");
    			p.textContent = `${/*jobOffer*/ ctx[0]}`;
    			attr_dev(h1, "class", "title svelte-1jkt6t5");
    			add_location(h1, file$c, 20, 0, 587);
    			add_location(h4, file$c, 26, 6, 867);
    			attr_dev(input0, "type", "file");
    			attr_dev(input0, "name", "file");
    			add_location(input0, file$c, 27, 6, 908);
    			add_location(br0, file$c, 27, 38, 940);
    			add_location(br1, file$c, 27, 42, 944);
    			attr_dev(input1, "type", "submit");
    			attr_dev(input1, "class", "round-border svelte-1jkt6t5");
    			input1.value = "Ajouter l'offre";
    			add_location(input1, file$c, 28, 6, 956);
    			attr_dev(form, "class", "form svelte-1jkt6t5");
    			attr_dev(form, "action", "https://localhost:44307/api/joboffer/upload");
    			attr_dev(form, "method", "POST");
    			attr_dev(form, "enctype", "multipart/form-data");
    			add_location(form, file$c, 25, 4, 743);
    			add_location(p, file$c, 30, 4, 1041);
    			attr_dev(div, "class", "offers svelte-1jkt6t5");
    			add_location(div, file$c, 21, 0, 631);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t2);
    			append_dev(div, form);
    			append_dev(form, h4);
    			append_dev(form, t4);
    			append_dev(form, input0);
    			append_dev(form, br0);
    			append_dev(form, br1);
    			append_dev(form, t5);
    			append_dev(form, input1);
    			append_dev(div, t6);
    			append_dev(div, p);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*hiringOffers*/ 2) {
    				each_value = /*hiringOffers*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, t2);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self) {
    	let jobOffer = "";

    	onMount(async () => {
    		
    	});

    	let hiringOffers = [
    		{
    			title: "Ingénieur support Microsoft H/F",
    			description: "",
    			id: 1
    		},
    		{
    			title: "Ingénieur support Microsoft H/F",
    			description: "Une description",
    			id: 2
    		}
    	];

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("jobOffer" in $$props) $$invalidate(0, jobOffer = $$props.jobOffer);
    		if ("hiringOffers" in $$props) $$invalidate(1, hiringOffers = $$props.hiringOffers);
    	};

    	return [jobOffer, hiringOffers];
    }

    class Recruiting extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Recruiting",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\Components\Details\Offers\GoData.svelte generated by Svelte v3.16.7 */

    const file$d = "src\\Components\\Details\\Offers\\GoData.svelte";

    function create_fragment$f(ctx) {
    	let div3;
    	let p0;
    	let b0;
    	let t1;
    	let br0;
    	let t2;
    	let br1;
    	let br2;
    	let t3;
    	let b1;
    	let t5;
    	let t6;
    	let div2;
    	let div0;
    	let iframe;
    	let iframe_src_value;
    	let t7;
    	let div1;
    	let p1;
    	let b2;
    	let t9;
    	let br3;
    	let t10;
    	let br4;
    	let br5;
    	let t11;
    	let br6;
    	let br7;
    	let t12;
    	let t13;
    	let br8;
    	let t14;
    	let p2;
    	let t16;
    	let img;
    	let img_src_value;
    	let t17;
    	let br9;
    	let t18;
    	let em;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			p0 = element("p");
    			b0 = element("b");
    			b0.textContent = "Donnez du sens à vos données !";
    			t1 = space();
    			br0 = element("br");
    			t2 = text("\r\n        Les données présentes dans votre entreprise sont parfois dispersées et inexploitables alors qu'elles pourraient vous aider à mieux piloter votre activité.\r\n        ");
    			br1 = element("br");
    			br2 = element("br");
    			t3 = text("\r\n        Avec ");
    			b1 = element("b");
    			b1.textContent = "Go Data";
    			t5 = text(", nos équipes vous accompagnent de bout en bout dans la modernisation de vos centres de données afin de tirer parti de la richesse de celles-ci.");
    			t6 = space();
    			div2 = element("div");
    			div0 = element("div");
    			iframe = element("iframe");
    			t7 = space();
    			div1 = element("div");
    			p1 = element("p");
    			b2 = element("b");
    			b2.textContent = "Notre valeur ajoutée";
    			t9 = text(" :\r\n                ");
    			br3 = element("br");
    			t10 = text("\r\n                La stratégie technique d'Eliade est basée sur un partenariat unique avec Microsoft.\r\n                ");
    			br4 = element("br");
    			br5 = element("br");
    			t11 = text("\r\n                Nos consultants sont certifiés afin de vous apporter le plus haut niveau de compétences.\r\n                ");
    			br6 = element("br");
    			br7 = element("br");
    			t12 = text("\r\n                Notre expertise est notre premier atout, à quoi s'ajoute des valeurs chères à l'entreprise: proximité, réactivité et qualité.");
    			t13 = space();
    			br8 = element("br");
    			t14 = space();
    			p2 = element("p");
    			p2.textContent = "Nous vous proposons de collecter, sécuriser et interpréter la richesse des données de votre entreprise de manière simple et efficace, à travers :";
    			t16 = space();
    			img = element("img");
    			t17 = space();
    			br9 = element("br");
    			t18 = space();
    			em = element("em");
    			em.textContent = "Nos clients témoignent : \"Aujourd'hui, nous pouvons croiser l'ensemble des données provenant d'univers multiples depuis un portail unique afin d'anticiper le comportement de nos clients.\"";
    			add_location(b0, file$d, 2, 8, 44);
    			add_location(br0, file$d, 3, 8, 91);
    			add_location(br1, file$d, 5, 8, 269);
    			add_location(br2, file$d, 5, 12, 273);
    			add_location(b1, file$d, 6, 13, 292);
    			add_location(p0, file$d, 1, 4, 31);
    			if (iframe.src !== (iframe_src_value = "https://www.youtube.com/embed/nvCGvoBPLKk")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "title", "Go Data");
    			attr_dev(iframe, "class", "iframe svelte-xsf659");
    			add_location(iframe, file$d, 10, 12, 537);
    			attr_dev(div0, "class", "video svelte-xsf659");
    			add_location(div0, file$d, 9, 8, 504);
    			add_location(b2, file$d, 14, 16, 718);
    			add_location(br3, file$d, 15, 16, 765);
    			add_location(br4, file$d, 17, 16, 888);
    			add_location(br5, file$d, 17, 20, 892);
    			add_location(br6, file$d, 19, 16, 1020);
    			add_location(br7, file$d, 19, 20, 1024);
    			add_location(p1, file$d, 13, 12, 697);
    			attr_dev(div1, "class", "video-desc svelte-xsf659");
    			add_location(div1, file$d, 12, 8, 659);
    			attr_dev(div2, "class", "flex-container svelte-xsf659");
    			add_location(div2, file$d, 8, 4, 466);
    			add_location(br8, file$d, 24, 4, 1223);
    			add_location(p2, file$d, 25, 4, 1233);
    			if (img.src !== (img_src_value = "images/Infographie.jfif")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Go Data");
    			attr_dev(img, "class", "image svelte-xsf659");
    			add_location(img, file$d, 26, 4, 1391);
    			add_location(br9, file$d, 27, 4, 1460);
    			add_location(em, file$d, 28, 4, 1470);
    			attr_dev(div3, "class", "description svelte-xsf659");
    			add_location(div3, file$d, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, p0);
    			append_dev(p0, b0);
    			append_dev(p0, t1);
    			append_dev(p0, br0);
    			append_dev(p0, t2);
    			append_dev(p0, br1);
    			append_dev(p0, br2);
    			append_dev(p0, t3);
    			append_dev(p0, b1);
    			append_dev(p0, t5);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, iframe);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			append_dev(div1, p1);
    			append_dev(p1, b2);
    			append_dev(p1, t9);
    			append_dev(p1, br3);
    			append_dev(p1, t10);
    			append_dev(p1, br4);
    			append_dev(p1, br5);
    			append_dev(p1, t11);
    			append_dev(p1, br6);
    			append_dev(p1, br7);
    			append_dev(p1, t12);
    			append_dev(div3, t13);
    			append_dev(div3, br8);
    			append_dev(div3, t14);
    			append_dev(div3, p2);
    			append_dev(div3, t16);
    			append_dev(div3, img);
    			append_dev(div3, t17);
    			append_dev(div3, br9);
    			append_dev(div3, t18);
    			append_dev(div3, em);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class GoData extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GoData",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\Components\Details\Offers\GoFast.svelte generated by Svelte v3.16.7 */

    const file$e = "src\\Components\\Details\\Offers\\GoFast.svelte";

    function create_fragment$g(ctx) {
    	let div;
    	let p0;
    	let b0;
    	let t1;
    	let br0;
    	let t2;
    	let br1;
    	let t3;
    	let t4;
    	let br2;
    	let t5;
    	let ul;
    	let li0;
    	let t7;
    	let li1;
    	let t9;
    	let li2;
    	let t11;
    	let li3;
    	let t13;
    	let li4;
    	let t15;
    	let li5;
    	let t17;
    	let li6;
    	let t19;
    	let li7;
    	let t21;
    	let img;
    	let img_src_value;
    	let t22;
    	let br3;
    	let t23;
    	let p1;
    	let t24;
    	let b1;
    	let t26;
    	let b2;
    	let t28;
    	let b3;
    	let t30;
    	let br4;
    	let br5;
    	let t31;
    	let b4;
    	let t33;
    	let br6;
    	let t34;
    	let br7;
    	let t35;
    	let br8;
    	let t36;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			b0 = element("b");
    			b0.textContent = "Communiquez et gagnez en efficacité avec Go Fast !";
    			t1 = space();
    			br0 = element("br");
    			t2 = text("\r\n        Détachez vous du fonctionnement du SI et recentrez vous sur l'essentiel. Revenez à votre cœur de métier !\r\n        ");
    			br1 = element("br");
    			t3 = text("\r\n        L'offre Go Fast allie les fonctionnalités Office 365 au savoir-faire Eliade, et vous permet de profiter d'une solution complète de la\r\n        migration de votre messagerie au support technique.");
    			t4 = space();
    			br2 = element("br");
    			t5 = text("\r\n    Comment ? Go Fast inclut :\r\n    ");
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Prise en compte de l'existant";
    			t7 = space();
    			li1 = element("li");
    			li1.textContent = "Activation des fonctionnalités de messagerie et de calendrier professionnel d'Office 365";
    			t9 = space();
    			li2 = element("li");
    			li2.textContent = "Migration de vos boites mails dans le nouvel environnement";
    			t11 = space();
    			li3 = element("li");
    			li3.textContent = "Accès à vos fichiers depuis n'importe où grâce à votre espace de stockage OneDrive en ligne";
    			t13 = space();
    			li4 = element("li");
    			li4.textContent = "Création de réunion en ligne et d'espaces d'échanges avec vos clients, fournisseurs et collègues avec Teams";
    			t15 = space();
    			li5 = element("li");
    			li5.textContent = "Mise à disposition de guide d'utilisation et tutoriels vidéos";
    			t17 = space();
    			li6 = element("li");
    			li6.textContent = "Accès à notre support niveau 3";
    			t19 = space();
    			li7 = element("li");
    			li7.textContent = "Cout à l'utilisateur et au mois";
    			t21 = space();
    			img = element("img");
    			t22 = space();
    			br3 = element("br");
    			t23 = space();
    			p1 = element("p");
    			t24 = text("Devenez une entreprise ");
    			b1 = element("b");
    			b1.textContent = "dynamique";
    			t26 = text(", ");
    			b2 = element("b");
    			b2.textContent = "mobile";
    			t28 = text(" et ");
    			b3 = element("b");
    			b3.textContent = "réactive";
    			t30 = text(". Nos équipes vous accompagnent dans une transition simple et efficace vers la solution Office 365 de Microsoft.\r\n        ");
    			br4 = element("br");
    			br5 = element("br");
    			t31 = space();
    			b4 = element("b");
    			b4.textContent = "Notre valeur ajoutée :";
    			t33 = space();
    			br6 = element("br");
    			t34 = text("\r\n        La stratégie technique d'Eliade est basée sur un partenariat unique avec Microsoft.\r\n        ");
    			br7 = element("br");
    			t35 = text("\r\n        Nos consultants sont certifiés afin de vous apporter le plus haut niveau de compétences.\r\n        ");
    			br8 = element("br");
    			t36 = text("\r\n        Notre expertise est notre premier atout, à quoi s'ajoute des valeurs chères à l'entreprise: proximité, réactivité et qualité.");
    			add_location(b0, file$e, 2, 8, 44);
    			add_location(br0, file$e, 3, 8, 111);
    			add_location(br1, file$e, 5, 8, 240);
    			add_location(p0, file$e, 1, 4, 31);
    			add_location(br2, file$e, 9, 4, 464);
    			attr_dev(li0, "class", "svelte-wi8msy");
    			add_location(li0, file$e, 12, 8, 520);
    			attr_dev(li1, "class", "svelte-wi8msy");
    			add_location(li1, file$e, 13, 8, 568);
    			attr_dev(li2, "class", "svelte-wi8msy");
    			add_location(li2, file$e, 14, 8, 675);
    			attr_dev(li3, "class", "svelte-wi8msy");
    			add_location(li3, file$e, 15, 8, 752);
    			attr_dev(li4, "class", "svelte-wi8msy");
    			add_location(li4, file$e, 16, 8, 862);
    			attr_dev(li5, "class", "svelte-wi8msy");
    			add_location(li5, file$e, 17, 8, 988);
    			attr_dev(li6, "class", "svelte-wi8msy");
    			add_location(li6, file$e, 18, 8, 1068);
    			attr_dev(li7, "class", "svelte-wi8msy");
    			add_location(li7, file$e, 19, 8, 1117);
    			attr_dev(ul, "class", "svelte-wi8msy");
    			add_location(ul, file$e, 11, 4, 506);
    			if (img.src !== (img_src_value = "images/MicrosoftTeams-image.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "O365");
    			attr_dev(img, "class", "image svelte-wi8msy");
    			add_location(img, file$e, 22, 4, 1180);
    			add_location(br3, file$e, 23, 4, 1254);
    			add_location(b1, file$e, 25, 31, 1300);
    			add_location(b2, file$e, 25, 49, 1318);
    			add_location(b3, file$e, 25, 66, 1335);
    			add_location(br4, file$e, 26, 8, 1472);
    			add_location(br5, file$e, 26, 12, 1476);
    			add_location(b4, file$e, 27, 8, 1490);
    			add_location(br6, file$e, 28, 8, 1529);
    			add_location(br7, file$e, 30, 8, 1636);
    			add_location(br8, file$e, 32, 8, 1748);
    			add_location(p1, file$e, 24, 4, 1264);
    			attr_dev(div, "class", "description svelte-wi8msy");
    			add_location(div, file$e, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, b0);
    			append_dev(p0, t1);
    			append_dev(p0, br0);
    			append_dev(p0, t2);
    			append_dev(p0, br1);
    			append_dev(p0, t3);
    			append_dev(div, t4);
    			append_dev(div, br2);
    			append_dev(div, t5);
    			append_dev(div, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t7);
    			append_dev(ul, li1);
    			append_dev(ul, t9);
    			append_dev(ul, li2);
    			append_dev(ul, t11);
    			append_dev(ul, li3);
    			append_dev(ul, t13);
    			append_dev(ul, li4);
    			append_dev(ul, t15);
    			append_dev(ul, li5);
    			append_dev(ul, t17);
    			append_dev(ul, li6);
    			append_dev(ul, t19);
    			append_dev(ul, li7);
    			append_dev(div, t21);
    			append_dev(div, img);
    			append_dev(div, t22);
    			append_dev(div, br3);
    			append_dev(div, t23);
    			append_dev(div, p1);
    			append_dev(p1, t24);
    			append_dev(p1, b1);
    			append_dev(p1, t26);
    			append_dev(p1, b2);
    			append_dev(p1, t28);
    			append_dev(p1, b3);
    			append_dev(p1, t30);
    			append_dev(p1, br4);
    			append_dev(p1, br5);
    			append_dev(p1, t31);
    			append_dev(p1, b4);
    			append_dev(p1, t33);
    			append_dev(p1, br6);
    			append_dev(p1, t34);
    			append_dev(p1, br7);
    			append_dev(p1, t35);
    			append_dev(p1, br8);
    			append_dev(p1, t36);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class GoFast extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GoFast",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\Components\Details\Offers\GoSmart.svelte generated by Svelte v3.16.7 */

    const file$f = "src\\Components\\Details\\Offers\\GoSmart.svelte";

    function create_fragment$h(ctx) {
    	let div;
    	let p0;
    	let b0;
    	let t1;
    	let br0;
    	let t2;
    	let t3;
    	let br1;
    	let t4;
    	let ul;
    	let li0;
    	let t6;
    	let li1;
    	let t8;
    	let li2;
    	let t10;
    	let li3;
    	let t12;
    	let li4;
    	let t14;
    	let li5;
    	let t16;
    	let li6;
    	let t18;
    	let li7;
    	let t20;
    	let li8;
    	let t22;
    	let img;
    	let img_src_value;
    	let t23;
    	let br2;
    	let t24;
    	let p1;
    	let t25;
    	let b1;
    	let t27;
    	let b2;
    	let t29;
    	let b3;
    	let t31;
    	let br3;
    	let br4;
    	let t32;
    	let b4;
    	let t34;
    	let br5;
    	let t35;
    	let br6;
    	let t36;
    	let br7;
    	let t37;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			b0 = element("b");
    			b0.textContent = "Communiquez, collaborez et gagnez en productivité grâce à Go Smart !";
    			t1 = space();
    			br0 = element("br");
    			t2 = text("\r\n        Vous souhaitez gagner en efficacité ? Simplifier la gestion de vos infrastructures ? Et favoriser le travail collaboratif au sein de votre organisation ?");
    			t3 = space();
    			br1 = element("br");
    			t4 = text("\r\n    L'offre Go Smart allie les fonctionnalités Office 365 au savoir-faire Eliade, et vous permet de profiter d'une solution complète comprenant l'accompagnement au changement, les formations et le support technique :\r\n    ");
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Prise en compte de l'existant";
    			t6 = space();
    			li1 = element("li");
    			li1.textContent = "Migration de vos boites mails dans le nouvel environnement";
    			t8 = space();
    			li2 = element("li");
    			li2.textContent = "Accès à vos fichiers depuis n'importe où grâce à votre espace de stockage OneDrive en ligne";
    			t10 = space();
    			li3 = element("li");
    			li3.textContent = "Création de réunion en ligne et d'espaces d'échanges avec vos clients, fournisseurs et collègues avec Teams";
    			t12 = space();
    			li4 = element("li");
    			li4.textContent = "Configuration des espaces collaboratifs SharePoint";
    			t14 = space();
    			li5 = element("li");
    			li5.textContent = "Activation de la solution de signatures de mails";
    			t16 = space();
    			li6 = element("li");
    			li6.textContent = "Formation des équipes techniques et des utilisateurs finaux";
    			t18 = space();
    			li7 = element("li");
    			li7.textContent = "Support technique MANAGEO";
    			t20 = space();
    			li8 = element("li");
    			li8.textContent = "Coût à l'utilisateur et au mois";
    			t22 = space();
    			img = element("img");
    			t23 = space();
    			br2 = element("br");
    			t24 = space();
    			p1 = element("p");
    			t25 = text("Devenez une entreprise ");
    			b1 = element("b");
    			b1.textContent = "dynamique";
    			t27 = text(", ");
    			b2 = element("b");
    			b2.textContent = "mobile";
    			t29 = text(" et ");
    			b3 = element("b");
    			b3.textContent = "réactive";
    			t31 = text(". Nos équipes vous accompagnent dans une transition simple et efficace vers la solution Office 365 de Microsoft.\r\n        ");
    			br3 = element("br");
    			br4 = element("br");
    			t32 = space();
    			b4 = element("b");
    			b4.textContent = "Notre valeur ajoutée :";
    			t34 = space();
    			br5 = element("br");
    			t35 = text("\r\n        La stratégie technique d'Eliade est basée sur un partenariat unique avec Microsoft.\r\n        ");
    			br6 = element("br");
    			t36 = text("\r\n        Nos consultants sont certifiés afin de vous apporter le plus haut niveau de compétences.\r\n        ");
    			br7 = element("br");
    			t37 = text("\r\n        Notre expertise est notre premier atout, à quoi s'ajoute des valeurs chères à l'entreprise: proximité, réactivité et qualité.");
    			add_location(b0, file$f, 2, 8, 44);
    			add_location(br0, file$f, 3, 8, 129);
    			add_location(p0, file$f, 1, 4, 31);
    			add_location(br1, file$f, 6, 4, 312);
    			attr_dev(li0, "class", "svelte-wi8msy");
    			add_location(li0, file$f, 9, 8, 554);
    			attr_dev(li1, "class", "svelte-wi8msy");
    			add_location(li1, file$f, 10, 8, 602);
    			attr_dev(li2, "class", "svelte-wi8msy");
    			add_location(li2, file$f, 11, 8, 679);
    			attr_dev(li3, "class", "svelte-wi8msy");
    			add_location(li3, file$f, 12, 8, 789);
    			attr_dev(li4, "class", "svelte-wi8msy");
    			add_location(li4, file$f, 13, 8, 915);
    			attr_dev(li5, "class", "svelte-wi8msy");
    			add_location(li5, file$f, 14, 8, 984);
    			attr_dev(li6, "class", "svelte-wi8msy");
    			add_location(li6, file$f, 15, 8, 1052);
    			attr_dev(li7, "class", "svelte-wi8msy");
    			add_location(li7, file$f, 16, 8, 1130);
    			attr_dev(li8, "class", "svelte-wi8msy");
    			add_location(li8, file$f, 17, 8, 1174);
    			attr_dev(ul, "class", "svelte-wi8msy");
    			add_location(ul, file$f, 8, 4, 540);
    			if (img.src !== (img_src_value = "images/MicrosoftTeams-image.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "O365");
    			attr_dev(img, "class", "image svelte-wi8msy");
    			add_location(img, file$f, 20, 4, 1237);
    			add_location(br2, file$f, 21, 4, 1311);
    			add_location(b1, file$f, 23, 31, 1357);
    			add_location(b2, file$f, 23, 49, 1375);
    			add_location(b3, file$f, 23, 66, 1392);
    			add_location(br3, file$f, 24, 8, 1529);
    			add_location(br4, file$f, 24, 12, 1533);
    			add_location(b4, file$f, 25, 8, 1547);
    			add_location(br5, file$f, 26, 8, 1586);
    			add_location(br6, file$f, 28, 8, 1693);
    			add_location(br7, file$f, 30, 8, 1805);
    			add_location(p1, file$f, 22, 4, 1321);
    			attr_dev(div, "class", "description svelte-wi8msy");
    			add_location(div, file$f, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, b0);
    			append_dev(p0, t1);
    			append_dev(p0, br0);
    			append_dev(p0, t2);
    			append_dev(div, t3);
    			append_dev(div, br1);
    			append_dev(div, t4);
    			append_dev(div, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t6);
    			append_dev(ul, li1);
    			append_dev(ul, t8);
    			append_dev(ul, li2);
    			append_dev(ul, t10);
    			append_dev(ul, li3);
    			append_dev(ul, t12);
    			append_dev(ul, li4);
    			append_dev(ul, t14);
    			append_dev(ul, li5);
    			append_dev(ul, t16);
    			append_dev(ul, li6);
    			append_dev(ul, t18);
    			append_dev(ul, li7);
    			append_dev(ul, t20);
    			append_dev(ul, li8);
    			append_dev(div, t22);
    			append_dev(div, img);
    			append_dev(div, t23);
    			append_dev(div, br2);
    			append_dev(div, t24);
    			append_dev(div, p1);
    			append_dev(p1, t25);
    			append_dev(p1, b1);
    			append_dev(p1, t27);
    			append_dev(p1, b2);
    			append_dev(p1, t29);
    			append_dev(p1, b3);
    			append_dev(p1, t31);
    			append_dev(p1, br3);
    			append_dev(p1, br4);
    			append_dev(p1, t32);
    			append_dev(p1, b4);
    			append_dev(p1, t34);
    			append_dev(p1, br5);
    			append_dev(p1, t35);
    			append_dev(p1, br6);
    			append_dev(p1, t36);
    			append_dev(p1, br7);
    			append_dev(p1, t37);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class GoSmart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GoSmart",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src\Components\Details\Offers\GoTeams.svelte generated by Svelte v3.16.7 */

    const file$g = "src\\Components\\Details\\Offers\\GoTeams.svelte";

    function create_fragment$i(ctx) {
    	let div3;
    	let p0;
    	let b0;
    	let t0;
    	let br0;
    	let t1;
    	let t2;
    	let br1;
    	let br2;
    	let t3;
    	let br3;
    	let t4;
    	let t5;
    	let br4;
    	let t6;
    	let ul;
    	let li0;
    	let t8;
    	let li1;
    	let t10;
    	let li2;
    	let t12;
    	let li3;
    	let t14;
    	let li4;
    	let t16;
    	let li5;
    	let t18;
    	let li6;
    	let t20;
    	let li7;
    	let t22;
    	let br5;
    	let t23;
    	let p1;
    	let t25;
    	let div2;
    	let div0;
    	let iframe;
    	let iframe_src_value;
    	let t26;
    	let div1;
    	let p2;
    	let b1;
    	let t28;
    	let br6;
    	let t29;
    	let br7;
    	let br8;
    	let t30;
    	let br9;
    	let br10;
    	let t31;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			p0 = element("p");
    			b0 = element("b");
    			t0 = text("Révolutionnez votre quotidien avec Microsoft Teams\r\n        ");
    			br0 = element("br");
    			t1 = text("Eliade vous accompagne dans la mise en place ou dans la transition de Skype vers Teams, outil intégré à Office 365.");
    			t2 = space();
    			br1 = element("br");
    			br2 = element("br");
    			t3 = text("\r\n        Vous souhaitez optimiser le travail collaboratif ? Faciliter les échanges avec les clients, fournisseurs, partenaires et collaborateurs ?\r\n        ");
    			br3 = element("br");
    			t4 = text("\r\n        Fédérer les équipes autour d'un projet ? Et gagner en efficacité ?");
    			t5 = space();
    			br4 = element("br");
    			t6 = text("\r\n    Go Teams inclut :\r\n    ");
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Prise en compte de l'existant";
    			t8 = space();
    			li1 = element("li");
    			li1.textContent = "Mise en place d'un plan de transition et élaboration d'un plan de gouvernance";
    			t10 = space();
    			li2 = element("li");
    			li2.textContent = "Communication auprès des utilisateurs";
    			t12 = space();
    			li3 = element("li");
    			li3.textContent = "Paramétrage et personnalisation de Teams";
    			t14 = space();
    			li4 = element("li");
    			li4.textContent = "Activation de Teams";
    			t16 = space();
    			li5 = element("li");
    			li5.textContent = "Formation des équipes techniques";
    			t18 = space();
    			li6 = element("li");
    			li6.textContent = "Conduite du changement des utilisateurs";
    			t20 = space();
    			li7 = element("li");
    			li7.textContent = "Support technique niveau 3";
    			t22 = space();
    			br5 = element("br");
    			t23 = space();
    			p1 = element("p");
    			p1.textContent = "Plus qu'une transition, profitez de l'expertise de nos consultants certifiés pour effectuer sereinement la mise en place de Teams.";
    			t25 = space();
    			div2 = element("div");
    			div0 = element("div");
    			iframe = element("iframe");
    			t26 = space();
    			div1 = element("div");
    			p2 = element("p");
    			b1 = element("b");
    			b1.textContent = "Notre valeur ajoutée";
    			t28 = text(" :\r\n                ");
    			br6 = element("br");
    			t29 = text("\r\n                La stratégie technique d'Eliade est basée sur un partenariat unique avec Microsoft.\r\n                ");
    			br7 = element("br");
    			br8 = element("br");
    			t30 = text("\r\n                Nos consultants sont certifiés afin de vous apporter le plus haut niveau de compétences.\r\n                ");
    			br9 = element("br");
    			br10 = element("br");
    			t31 = text("\r\n                Notre expertise est notre premier atout, à quoi s'ajoute des valeurs chères à l'entreprise: proximité, réactivité et qualité.");
    			add_location(br0, file$g, 3, 8, 107);
    			add_location(b0, file$g, 2, 8, 44);
    			add_location(br1, file$g, 4, 8, 240);
    			add_location(br2, file$g, 4, 12, 244);
    			add_location(br3, file$g, 6, 8, 405);
    			add_location(p0, file$g, 1, 4, 31);
    			add_location(br4, file$g, 9, 4, 501);
    			attr_dev(li0, "class", "svelte-5syj6m");
    			add_location(li0, file$g, 12, 8, 548);
    			attr_dev(li1, "class", "svelte-5syj6m");
    			add_location(li1, file$g, 13, 8, 596);
    			attr_dev(li2, "class", "svelte-5syj6m");
    			add_location(li2, file$g, 14, 8, 692);
    			attr_dev(li3, "class", "svelte-5syj6m");
    			add_location(li3, file$g, 15, 8, 748);
    			attr_dev(li4, "class", "svelte-5syj6m");
    			add_location(li4, file$g, 16, 8, 807);
    			attr_dev(li5, "class", "svelte-5syj6m");
    			add_location(li5, file$g, 17, 8, 845);
    			attr_dev(li6, "class", "svelte-5syj6m");
    			add_location(li6, file$g, 18, 8, 896);
    			attr_dev(li7, "class", "svelte-5syj6m");
    			add_location(li7, file$g, 19, 8, 954);
    			attr_dev(ul, "class", "svelte-5syj6m");
    			add_location(ul, file$g, 11, 4, 534);
    			add_location(br5, file$g, 21, 4, 1006);
    			add_location(p1, file$g, 22, 4, 1016);
    			if (iframe.src !== (iframe_src_value = "https://www.youtube.com/embed/GZAdeDZzG-g")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "title", "Go Teams");
    			attr_dev(iframe, "class", "iframe svelte-5syj6m");
    			add_location(iframe, file$g, 25, 12, 1230);
    			attr_dev(div0, "class", "video svelte-5syj6m");
    			add_location(div0, file$g, 24, 8, 1197);
    			add_location(b1, file$g, 29, 16, 1412);
    			add_location(br6, file$g, 30, 16, 1459);
    			add_location(br7, file$g, 32, 16, 1582);
    			add_location(br8, file$g, 32, 20, 1586);
    			add_location(br9, file$g, 34, 16, 1714);
    			add_location(br10, file$g, 34, 20, 1718);
    			add_location(p2, file$g, 28, 12, 1391);
    			attr_dev(div1, "class", "video-desc svelte-5syj6m");
    			add_location(div1, file$g, 27, 8, 1353);
    			attr_dev(div2, "class", "flex-container svelte-5syj6m");
    			add_location(div2, file$g, 23, 4, 1159);
    			attr_dev(div3, "class", "description svelte-5syj6m");
    			add_location(div3, file$g, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, p0);
    			append_dev(p0, b0);
    			append_dev(b0, t0);
    			append_dev(b0, br0);
    			append_dev(b0, t1);
    			append_dev(p0, t2);
    			append_dev(p0, br1);
    			append_dev(p0, br2);
    			append_dev(p0, t3);
    			append_dev(p0, br3);
    			append_dev(p0, t4);
    			append_dev(div3, t5);
    			append_dev(div3, br4);
    			append_dev(div3, t6);
    			append_dev(div3, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t8);
    			append_dev(ul, li1);
    			append_dev(ul, t10);
    			append_dev(ul, li2);
    			append_dev(ul, t12);
    			append_dev(ul, li3);
    			append_dev(ul, t14);
    			append_dev(ul, li4);
    			append_dev(ul, t16);
    			append_dev(ul, li5);
    			append_dev(ul, t18);
    			append_dev(ul, li6);
    			append_dev(ul, t20);
    			append_dev(ul, li7);
    			append_dev(div3, t22);
    			append_dev(div3, br5);
    			append_dev(div3, t23);
    			append_dev(div3, p1);
    			append_dev(div3, t25);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, iframe);
    			append_dev(div2, t26);
    			append_dev(div2, div1);
    			append_dev(div1, p2);
    			append_dev(p2, b1);
    			append_dev(p2, t28);
    			append_dev(p2, br6);
    			append_dev(p2, t29);
    			append_dev(p2, br7);
    			append_dev(p2, br8);
    			append_dev(p2, t30);
    			append_dev(p2, br9);
    			append_dev(p2, br10);
    			append_dev(p2, t31);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class GoTeams extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GoTeams",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src\Components\Details\Offers\GoAccessSecurity.svelte generated by Svelte v3.16.7 */

    const file$h = "src\\Components\\Details\\Offers\\GoAccessSecurity.svelte";

    function create_fragment$j(ctx) {
    	let div3;
    	let p0;
    	let t0;
    	let br0;
    	let t1;
    	let br1;
    	let t2;
    	let b0;
    	let t4;
    	let div2;
    	let div0;
    	let iframe;
    	let iframe_src_value;
    	let t5;
    	let div1;
    	let p1;
    	let b1;
    	let t7;
    	let br2;
    	let t8;
    	let br3;
    	let br4;
    	let t9;
    	let br5;
    	let br6;
    	let t10;
    	let t11;
    	let br7;
    	let t12;
    	let ul0;
    	let li0;
    	let t14;
    	let li1;
    	let t16;
    	let li2;
    	let t18;
    	let li3;
    	let t20;
    	let li4;
    	let t22;
    	let li5;
    	let t24;
    	let li6;
    	let t26;
    	let li7;
    	let t28;
    	let br8;
    	let t29;
    	let img;
    	let img_src_value;
    	let t30;
    	let br9;
    	let t31;
    	let br10;
    	let t32;
    	let ul1;
    	let li8;
    	let t34;
    	let li9;
    	let t36;
    	let li10;
    	let t38;
    	let li11;
    	let t40;
    	let li12;
    	let t42;
    	let li13;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			p0 = element("p");
    			t0 = text("Favorisez l'expérience utlisateur tout en protégeant les données de votre entreprise !\r\n        ");
    			br0 = element("br");
    			t1 = text("\r\n        Protégez vos données depuis le Cloud, gérez vos équipements mobiles et gagnez en flexibilité.\r\n        ");
    			br1 = element("br");
    			t2 = space();
    			b0 = element("b");
    			b0.textContent = "Les données de votre entreprise sont-elles sécurisées en cas de perte, de vol ou de corruption de l'un de vos appareils ?";
    			t4 = space();
    			div2 = element("div");
    			div0 = element("div");
    			iframe = element("iframe");
    			t5 = space();
    			div1 = element("div");
    			p1 = element("p");
    			b1 = element("b");
    			b1.textContent = "Notre valeur ajoutée";
    			t7 = text(" :\r\n                ");
    			br2 = element("br");
    			t8 = text("\r\n                La stratégie technique d'Eliade est basée sur un partenariat unique avec Microsoft.\r\n                ");
    			br3 = element("br");
    			br4 = element("br");
    			t9 = text("\r\n                Nos consultants sont certifiés afin de vous apporter le plus haut niveau de compétences.\r\n                ");
    			br5 = element("br");
    			br6 = element("br");
    			t10 = text("\r\n                Notre expertise est notre premier atout, à quoi s'ajoute des valeurs chères à l'entreprise: proximité, réactivité et qualité.");
    			t11 = space();
    			br7 = element("br");
    			t12 = text("\r\n    Go Access & Security inclut :\r\n    ");
    			ul0 = element("ul");
    			li0 = element("li");
    			li0.textContent = "Établir un inventaire de la flotte mobile grâce à Intune";
    			t14 = space();
    			li1 = element("li");
    			li1.textContent = "Maîtriser les applications installées sur les équipements utilisateurs";
    			t16 = space();
    			li2 = element("li");
    			li2.textContent = "Gérer les périphériques autorisés à accéder aux données de l'entreprise";
    			t18 = space();
    			li3 = element("li");
    			li3.textContent = "Contrôler les informations de l'entreprise et la façon dont les collaborateurs les partagent";
    			t20 = space();
    			li4 = element("li");
    			li4.textContent = "Distinguer les appareils professionnels et personnels";
    			t22 = space();
    			li5 = element("li");
    			li5.textContent = "Sécuriser l'accès à l'environnement professionnel via l'authentification multi-facteurs (MFA)";
    			t24 = space();
    			li6 = element("li");
    			li6.textContent = "Vérifier que les appareils et les applications sont conformes aux exigences de sécurité de l'entreprise";
    			t26 = space();
    			li7 = element("li");
    			li7.textContent = "Réduire les coûts de gestion d'infrastructure";
    			t28 = space();
    			br8 = element("br");
    			t29 = space();
    			img = element("img");
    			t30 = space();
    			br9 = element("br");
    			t31 = space();
    			br10 = element("br");
    			t32 = text("\r\n    Afin de vous permettre :\r\n    ");
    			ul1 = element("ul");
    			li8 = element("li");
    			li8.textContent = "Améliorer de façon continue la sécurisation des données de l’entreprise";
    			t34 = space();
    			li9 = element("li");
    			li9.textContent = "Faire face aux menaces externes";
    			t36 = space();
    			li10 = element("li");
    			li10.textContent = "Permettre aux collaborateurs d’accéder à leurs environnements de travail depuis tous périphériques";
    			t38 = space();
    			li11 = element("li");
    			li11.textContent = "Encourager la mobilité des équipes et favoriser le télétravail";
    			t40 = space();
    			li12 = element("li");
    			li12.textContent = "Simplifier et maitriser la gestion des périphériques mobiles";
    			t42 = space();
    			li13 = element("li");
    			li13.textContent = "Accompagner techniquement le droit à la déconnexion";
    			add_location(br0, file$h, 3, 8, 140);
    			add_location(br1, file$h, 5, 8, 257);
    			add_location(b0, file$h, 6, 8, 271);
    			add_location(p0, file$h, 1, 4, 31);
    			if (iframe.src !== (iframe_src_value = "https://www.youtube.com/embed/4xcS2Hzraqg")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "title", "Go Access & Security");
    			attr_dev(iframe, "class", "iframe svelte-1cgy0wu");
    			add_location(iframe, file$h, 10, 12, 486);
    			attr_dev(div0, "class", "video svelte-1cgy0wu");
    			add_location(div0, file$h, 9, 8, 453);
    			add_location(b1, file$h, 14, 16, 684);
    			add_location(br2, file$h, 15, 16, 731);
    			add_location(br3, file$h, 17, 16, 854);
    			add_location(br4, file$h, 17, 20, 858);
    			add_location(br5, file$h, 19, 16, 986);
    			add_location(br6, file$h, 19, 20, 990);
    			add_location(p1, file$h, 13, 12, 663);
    			attr_dev(div1, "class", "video-desc svelte-1cgy0wu");
    			add_location(div1, file$h, 12, 8, 625);
    			attr_dev(div2, "class", "flex-container svelte-1cgy0wu");
    			add_location(div2, file$h, 8, 4, 415);
    			add_location(br7, file$h, 24, 4, 1189);
    			attr_dev(li0, "class", "svelte-1cgy0wu");
    			add_location(li0, file$h, 27, 8, 1248);
    			attr_dev(li1, "class", "svelte-1cgy0wu");
    			add_location(li1, file$h, 28, 8, 1330);
    			attr_dev(li2, "class", "svelte-1cgy0wu");
    			add_location(li2, file$h, 29, 8, 1420);
    			attr_dev(li3, "class", "svelte-1cgy0wu");
    			add_location(li3, file$h, 30, 8, 1510);
    			attr_dev(li4, "class", "svelte-1cgy0wu");
    			add_location(li4, file$h, 31, 8, 1621);
    			attr_dev(li5, "class", "svelte-1cgy0wu");
    			add_location(li5, file$h, 32, 8, 1693);
    			attr_dev(li6, "class", "svelte-1cgy0wu");
    			add_location(li6, file$h, 33, 8, 1805);
    			attr_dev(li7, "class", "svelte-1cgy0wu");
    			add_location(li7, file$h, 34, 8, 1927);
    			attr_dev(ul0, "class", "svelte-1cgy0wu");
    			add_location(ul0, file$h, 26, 4, 1234);
    			add_location(br8, file$h, 36, 4, 1998);
    			if (img.src !== (img_src_value = "images/intune.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Intune");
    			attr_dev(img, "class", "image svelte-1cgy0wu");
    			add_location(img, file$h, 37, 4, 2008);
    			add_location(br9, file$h, 38, 4, 2070);
    			add_location(br10, file$h, 39, 4, 2080);
    			attr_dev(li8, "class", "svelte-1cgy0wu");
    			add_location(li8, file$h, 42, 8, 2134);
    			attr_dev(li9, "class", "svelte-1cgy0wu");
    			add_location(li9, file$h, 43, 8, 2224);
    			attr_dev(li10, "class", "svelte-1cgy0wu");
    			add_location(li10, file$h, 44, 8, 2274);
    			attr_dev(li11, "class", "svelte-1cgy0wu");
    			add_location(li11, file$h, 45, 8, 2391);
    			attr_dev(li12, "class", "svelte-1cgy0wu");
    			add_location(li12, file$h, 46, 8, 2472);
    			attr_dev(li13, "class", "svelte-1cgy0wu");
    			add_location(li13, file$h, 47, 8, 2551);
    			attr_dev(ul1, "class", "svelte-1cgy0wu");
    			add_location(ul1, file$h, 41, 4, 2120);
    			attr_dev(div3, "class", "description svelte-1cgy0wu");
    			add_location(div3, file$h, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, p0);
    			append_dev(p0, t0);
    			append_dev(p0, br0);
    			append_dev(p0, t1);
    			append_dev(p0, br1);
    			append_dev(p0, t2);
    			append_dev(p0, b0);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, iframe);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, p1);
    			append_dev(p1, b1);
    			append_dev(p1, t7);
    			append_dev(p1, br2);
    			append_dev(p1, t8);
    			append_dev(p1, br3);
    			append_dev(p1, br4);
    			append_dev(p1, t9);
    			append_dev(p1, br5);
    			append_dev(p1, br6);
    			append_dev(p1, t10);
    			append_dev(div3, t11);
    			append_dev(div3, br7);
    			append_dev(div3, t12);
    			append_dev(div3, ul0);
    			append_dev(ul0, li0);
    			append_dev(ul0, t14);
    			append_dev(ul0, li1);
    			append_dev(ul0, t16);
    			append_dev(ul0, li2);
    			append_dev(ul0, t18);
    			append_dev(ul0, li3);
    			append_dev(ul0, t20);
    			append_dev(ul0, li4);
    			append_dev(ul0, t22);
    			append_dev(ul0, li5);
    			append_dev(ul0, t24);
    			append_dev(ul0, li6);
    			append_dev(ul0, t26);
    			append_dev(ul0, li7);
    			append_dev(div3, t28);
    			append_dev(div3, br8);
    			append_dev(div3, t29);
    			append_dev(div3, img);
    			append_dev(div3, t30);
    			append_dev(div3, br9);
    			append_dev(div3, t31);
    			append_dev(div3, br10);
    			append_dev(div3, t32);
    			append_dev(div3, ul1);
    			append_dev(ul1, li8);
    			append_dev(ul1, t34);
    			append_dev(ul1, li9);
    			append_dev(ul1, t36);
    			append_dev(ul1, li10);
    			append_dev(ul1, t38);
    			append_dev(ul1, li11);
    			append_dev(ul1, t40);
    			append_dev(ul1, li12);
    			append_dev(ul1, t42);
    			append_dev(ul1, li13);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class GoAccessSecurity extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GoAccessSecurity",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src\Components\Details\Offers\GoFinops.svelte generated by Svelte v3.16.7 */

    const file$i = "src\\Components\\Details\\Offers\\GoFinops.svelte";

    function create_fragment$k(ctx) {
    	let div;
    	let b;
    	let t1;
    	let br0;
    	let t2;
    	let br1;
    	let t3;
    	let ul;
    	let li0;
    	let t5;
    	let li1;
    	let t7;
    	let li2;
    	let t9;
    	let li3;
    	let t11;
    	let img0;
    	let img0_src_value;
    	let t12;
    	let t13;
    	let img1;
    	let img1_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			b = element("b");
    			b.textContent = "Maitrisez votre consommation Azure !";
    			t1 = space();
    			br0 = element("br");
    			t2 = space();
    			br1 = element("br");
    			t3 = text("\r\n    Vous souhaitez :\r\n    ");
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Maitriser les couts et payer le juste prix ?";
    			t5 = space();
    			li1 = element("li");
    			li1.textContent = "Détailler les investissements « as a service » ?";
    			t7 = space();
    			li2 = element("li");
    			li2.textContent = "Être proactif sur votre consommation ?";
    			t9 = space();
    			li3 = element("li");
    			li3.textContent = "Tirer parti des forces du Cloud public ?";
    			t11 = text("\r\n\r\n    Avec Go FinOps, faisons le point sur votre consommation Azure en 4 étapes :\r\n    ");
    			img0 = element("img");
    			t12 = text("\r\n    Optimisons vos couts pour en faire plus avec moins :");
    			t13 = space();
    			img1 = element("img");
    			add_location(b, file$i, 1, 4, 31);
    			add_location(br0, file$i, 2, 4, 80);
    			add_location(br1, file$i, 3, 4, 90);
    			add_location(li0, file$i, 6, 8, 136);
    			add_location(li1, file$i, 7, 8, 199);
    			add_location(li2, file$i, 8, 8, 266);
    			add_location(li3, file$i, 9, 8, 323);
    			add_location(ul, file$i, 5, 4, 122);
    			if (img0.src !== (img0_src_value = "images/Go FinOps.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Go Finops");
    			attr_dev(img0, "class", "image svelte-1p7f7we");
    			add_location(img0, file$i, 13, 4, 472);
    			attr_dev(div, "class", "description svelte-1p7f7we");
    			add_location(div, file$i, 0, 0, 0);
    			if (img1.src !== (img1_src_value = "images/Go FinOps 1.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Go Finops");
    			attr_dev(img1, "class", "image-fullscreen svelte-1p7f7we");
    			add_location(img1, file$i, 16, 0, 602);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, b);
    			append_dev(div, t1);
    			append_dev(div, br0);
    			append_dev(div, t2);
    			append_dev(div, br1);
    			append_dev(div, t3);
    			append_dev(div, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t5);
    			append_dev(ul, li1);
    			append_dev(ul, t7);
    			append_dev(ul, li2);
    			append_dev(ul, t9);
    			append_dev(ul, li3);
    			append_dev(div, t11);
    			append_dev(div, img0);
    			append_dev(div, t12);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, img1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(img1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class GoFinops extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GoFinops",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src\Components\Details\Offers.svelte generated by Svelte v3.16.7 */
    const file$j = "src\\Components\\Details\\Offers.svelte";

    // (36:0) {:else}
    function create_else_block$1(ctx) {
    	let p;
    	let t0;
    	let b;
    	let t1_value = /*params*/ ctx[0].offer + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Désolé, nous n'avons pas d'offre correspondant à votre demande ");
    			b = element("b");
    			t1 = text(t1_value);
    			t2 = text(" !");
    			add_location(b, file$j, 36, 68, 1219);
    			attr_dev(p, "class", "svelte-1qrgk2s");
    			add_location(p, file$j, 36, 2, 1153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, b);
    			append_dev(b, t1);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*params*/ 1 && t1_value !== (t1_value = /*params*/ ctx[0].offer + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(36:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (34:39) 
    function create_if_block_5(ctx) {
    	let current;
    	const gofinops = new GoFinops({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(gofinops.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gofinops, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gofinops.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gofinops.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gofinops, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(34:39) ",
    		ctx
    	});

    	return block;
    }

    // (32:48) 
    function create_if_block_4(ctx) {
    	let current;
    	const goaccesssecurity = new GoAccessSecurity({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(goaccesssecurity.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(goaccesssecurity, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(goaccesssecurity.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(goaccesssecurity.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(goaccesssecurity, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(32:48) ",
    		ctx
    	});

    	return block;
    }

    // (30:38) 
    function create_if_block_3(ctx) {
    	let current;
    	const goteams = new GoTeams({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(goteams.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(goteams, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(goteams.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(goteams.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(goteams, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(30:38) ",
    		ctx
    	});

    	return block;
    }

    // (28:38) 
    function create_if_block_2(ctx) {
    	let current;
    	const gosmart = new GoSmart({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(gosmart.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gosmart, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gosmart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gosmart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gosmart, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(28:38) ",
    		ctx
    	});

    	return block;
    }

    // (26:37) 
    function create_if_block_1(ctx) {
    	let current;
    	const gofast = new GoFast({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(gofast.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gofast, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gofast.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gofast.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gofast, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(26:37) ",
    		ctx
    	});

    	return block;
    }

    // (24:0) {#if params.offer === "go-data"}
    function create_if_block$3(ctx) {
    	let current;
    	const godata = new GoData({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(godata.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(godata, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(godata.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(godata.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(godata, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(24:0) {#if params.offer === \\\"go-data\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let h1;
    	let t0_value = /*currentOffer*/ ctx[1].label + "";
    	let t0;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	const if_block_creators = [
    		create_if_block$3,
    		create_if_block_1,
    		create_if_block_2,
    		create_if_block_3,
    		create_if_block_4,
    		create_if_block_5,
    		create_else_block$1
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*params*/ ctx[0].offer === "go-data") return 0;
    		if (/*params*/ ctx[0].offer === "go-fast") return 1;
    		if (/*params*/ ctx[0].offer === "go-smart") return 2;
    		if (/*params*/ ctx[0].offer === "go-teams") return 3;
    		if (/*params*/ ctx[0].offer === "go-access-security") return 4;
    		if (/*params*/ ctx[0].offer === "go-finops") return 5;
    		return 6;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(h1, "class", "title svelte-1qrgk2s");
    			add_location(h1, file$j, 22, 0, 755);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*currentOffer*/ 2) && t0_value !== (t0_value = /*currentOffer*/ ctx[1].label + "")) set_data_dev(t0, t0_value);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { params = {} } = $$props;
    	let currentOffer = { label: "Aucune offre !", page: "" };
    	const offers = getOffers();

    	if (params.offer) {
    		let offer = offers.find(o => o.page.includes(params.offer));

    		if (offer) {
    			currentOffer = offer;
    		}
    	}

    	window.scrollTo(0, 0);
    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Offers> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    	};

    	$$self.$capture_state = () => {
    		return { params, currentOffer };
    	};

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    		if ("currentOffer" in $$props) $$invalidate(1, currentOffer = $$props.currentOffer);
    	};

    	return [params, currentOffer];
    }

    class Offers extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$l, safe_not_equal, { params: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Offers",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get params() {
    		throw new Error("<Offers>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<Offers>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const routes = {
        "/": Home,
        "/company/recruiting": Recruiting,
        "/company/certifications": Certifications,
        "/company/skills": Skills,
        "/services/:service?": Services,
        "/offers/:offer?": Offers,
        "/partners/:id?": Partners
    };

    /* src\App.svelte generated by Svelte v3.16.7 */

    function create_fragment$m(ctx) {
    	let t0;
    	let t1;
    	let current;

    	const navbar = new Navbar({
    			props: { navlists: getNavbarData() },
    			$$inline: true
    		});

    	const router = new Router({ props: { routes }, $$inline: true });

    	const footer = new Footer({
    			props: {
    				footerData: getFooterData(),
    				header: getHeader()
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			create_component(router.$$.fragment);
    			t1 = space();
    			create_component(footer.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(router, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(router, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
