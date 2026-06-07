<?php
/**
 * Plugin Name: Imprelapp - Código del Vendedor
 * Description: Campo opcional "Código del Vendedor" en carrito WooCommerce. Guarda en pedido para tracking.
 * Version: 1.0.0
 * Author: Imprelapp
 * Text Domain: imprelapp
 */

if ( ! defined( 'ABSPATH' ) ) exit;

class Imprelapp_Vendor_Code {

    public function __construct() {
        // Mostrar campo en carrito
        add_action( 'woocommerce_before_cart_totals', [ $this, 'render_field' ] );

        // Guardar en sesión vía AJAX
        add_action( 'wp_ajax_imprelapp_save_vendor_code',        [ $this, 'ajax_save' ] );
        add_action( 'wp_ajax_nopriv_imprelapp_save_vendor_code', [ $this, 'ajax_save' ] );

        // Script en carrito
        add_action( 'wp_footer', [ $this, 'enqueue_script' ] );

        // Pasar valor a checkout (campo oculto)
        add_action( 'woocommerce_after_order_notes', [ $this, 'checkout_hidden_field' ] );

        // Guardar en pedido al confirmar
        add_action( 'woocommerce_checkout_order_created', [ $this, 'save_to_order' ] );

        // Mostrar en panel admin del pedido
        add_action( 'woocommerce_admin_order_data_after_billing_address', [ $this, 'render_admin' ] );

        // Incluir en emails de WooCommerce
        add_action( 'woocommerce_email_after_order_table', [ $this, 'render_email' ], 10, 2 );

        // Columna en listado de pedidos admin
        add_filter( 'manage_woocommerce_page_wc-orders_columns', [ $this, 'add_orders_column' ] );
        add_action( 'manage_woocommerce_page_wc-orders_custom_column', [ $this, 'render_orders_column' ], 10, 2 );

        // CSS
        add_action( 'wp_head', [ $this, 'render_styles' ] );
    }

    // -----------------------------------------------------------------
    // Campo visible en carrito
    // -----------------------------------------------------------------
    public function render_field() {
        $saved = WC()->session ? WC()->session->get( 'imprelapp_vendor_code', '' ) : '';
        ?>
        <div class="imprelapp-vendor-wrap">
            <p class="imprelapp-vendor-label">
                <?php esc_html_e( '¿Tienes un código de vendedor?', 'imprelapp' ); ?>
                <span class="imprelapp-optional">(opcional)</span>
            </p>
            <div class="imprelapp-vendor-row">
                <input
                    type="text"
                    id="imprelapp_vendor_code"
                    name="imprelapp_vendor_code"
                    class="input-text"
                    value="<?php echo esc_attr( $saved ); ?>"
                    placeholder="Ej: VEND-001"
                    maxlength="50"
                    autocomplete="off"
                />
                <button type="button" id="imprelapp_apply_vendor" class="button imprelapp-btn">
                    <?php echo $saved ? esc_html__( '✓ Aplicado', 'imprelapp' ) : esc_html__( 'Aplicar', 'imprelapp' ); ?>
                </button>
            </div>
            <span class="imprelapp-feedback" aria-live="polite"></span>
        </div>
        <?php
    }

    // -----------------------------------------------------------------
    // AJAX: guardar en sesión WC
    // -----------------------------------------------------------------
    public function ajax_save() {
        check_ajax_referer( 'imprelapp_vendor_nonce', 'nonce' );

        $code = isset( $_POST['vendor_code'] ) ? sanitize_text_field( wp_unslash( $_POST['vendor_code'] ) ) : '';

        if ( WC()->session ) {
            WC()->session->set( 'imprelapp_vendor_code', $code );
        }

        wp_send_json_success( [ 'code' => $code ] );
    }

    // -----------------------------------------------------------------
    // Script jQuery en pie de página del carrito
    // -----------------------------------------------------------------
    public function enqueue_script() {
        if ( ! is_cart() ) return;
        $nonce = wp_create_nonce( 'imprelapp_vendor_nonce' );
        ?>
        <script>
        (function($){
            var ajaxUrl = typeof wc_cart_params !== 'undefined' ? wc_cart_params.ajax_url : '<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>';

            $('#imprelapp_apply_vendor').on('click', function(){
                var $btn  = $(this);
                var $fb   = $('.imprelapp-feedback');
                var code  = $('#imprelapp_vendor_code').val().trim();

                $btn.prop('disabled', true).text('Guardando…');

                $.post(ajaxUrl, {
                    action: 'imprelapp_save_vendor_code',
                    vendor_code: code,
                    nonce: '<?php echo esc_js( $nonce ); ?>'
                }, function(r){
                    if (r.success) {
                        $btn.text(code ? '✓ Aplicado' : 'Aplicar');
                        $fb.text(code ? 'Código guardado correctamente.' : 'Código eliminado.').addClass('success');
                    } else {
                        $btn.text('Aplicar');
                        $fb.text('Error al guardar. Intenta de nuevo.').addClass('error');
                    }
                    $btn.prop('disabled', false);
                    setTimeout(function(){ $fb.text('').removeClass('success error'); }, 3000);
                }).fail(function(){
                    $btn.prop('disabled', false).text('Aplicar');
                    $fb.text('Error de conexión.').addClass('error');
                    setTimeout(function(){ $fb.text('').removeClass('error'); }, 3000);
                });
            });
        })(jQuery);
        </script>
        <?php
    }

    // -----------------------------------------------------------------
    // Campo oculto en checkout para pasar el código
    // -----------------------------------------------------------------
    public function checkout_hidden_field() {
        $code = WC()->session ? WC()->session->get( 'imprelapp_vendor_code', '' ) : '';
        if ( $code ) {
            echo '<input type="hidden" name="imprelapp_vendor_code" value="' . esc_attr( $code ) . '">';
        }
    }

    // -----------------------------------------------------------------
    // Guardar en meta del pedido
    // -----------------------------------------------------------------
    public function save_to_order( $order ) {
        $code = '';

        // Desde POST (checkout)
        if ( isset( $_POST['imprelapp_vendor_code'] ) ) {
            $code = sanitize_text_field( wp_unslash( $_POST['imprelapp_vendor_code'] ) );
        }

        // Desde sesión como respaldo
        if ( ! $code && WC()->session ) {
            $code = WC()->session->get( 'imprelapp_vendor_code', '' );
        }

        if ( $code ) {
            $order->update_meta_data( '_imprelapp_vendor_code', $code );
            $order->save();
        }

        // Limpiar sesión
        if ( WC()->session ) {
            WC()->session->set( 'imprelapp_vendor_code', '' );
        }
    }

    // -----------------------------------------------------------------
    // Panel admin: detalle del pedido
    // -----------------------------------------------------------------
    public function render_admin( $order ) {
        $code = $order->get_meta( '_imprelapp_vendor_code' );
        if ( ! $code ) return;
        echo '<p><strong>' . esc_html__( 'Código del Vendedor:', 'imprelapp' ) . '</strong> '
             . esc_html( $code ) . '</p>';
    }

    // -----------------------------------------------------------------
    // Email de confirmación
    // -----------------------------------------------------------------
    public function render_email( $order, $sent_to_admin ) {
        $code = $order->get_meta( '_imprelapp_vendor_code' );
        if ( ! $code ) return;
        echo '<p><strong>' . esc_html__( 'Código del Vendedor:', 'imprelapp' ) . '</strong> '
             . esc_html( $code ) . '</p>';
    }

    // -----------------------------------------------------------------
    // Columna extra en listado de pedidos (WC 7.1+ HPOS)
    // -----------------------------------------------------------------
    public function add_orders_column( $columns ) {
        $new = [];
        foreach ( $columns as $key => $label ) {
            $new[ $key ] = $label;
            if ( 'order_total' === $key ) {
                $new['vendor_code'] = __( 'Cód. Vendedor', 'imprelapp' );
            }
        }
        return $new;
    }

    public function render_orders_column( $column, $order ) {
        if ( 'vendor_code' !== $column ) return;
        $code = $order->get_meta( '_imprelapp_vendor_code' );
        echo $code ? '<strong>' . esc_html( $code ) . '</strong>' : '—';
    }

    // -----------------------------------------------------------------
    // Estilos
    // -----------------------------------------------------------------
    public function render_styles() {
        if ( ! is_cart() ) return;
        ?>
        <style>
        .imprelapp-vendor-wrap {
            margin: 24px 0;
            padding: 20px 24px;
            background: #EEF4FF;
            border: 1px solid #08428C33;
            border-left: 4px solid #08428C;
            border-radius: 6px;
        }
        .imprelapp-vendor-label {
            margin: 0 0 12px;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            color: #08428C;
            font-size: 15px;
        }
        .imprelapp-optional {
            font-weight: 400;
            color: #666;
            font-size: 13px;
            margin-left: 6px;
        }
        .imprelapp-vendor-row {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        .imprelapp-vendor-row #imprelapp_vendor_code {
            flex: 1;
            max-width: 280px;
            font-family: 'Inter', sans-serif;
            border: 1px solid #08428C66;
            border-radius: 4px;
            padding: 10px 14px;
        }
        .imprelapp-vendor-row #imprelapp_vendor_code:focus {
            border-color: #08428C;
            outline: none;
            box-shadow: 0 0 0 3px #08428C22;
        }
        .imprelapp-btn {
            background: #08428C !important;
            color: #fff !important;
            font-family: 'Inter', sans-serif !important;
            font-weight: 600 !important;
            border-radius: 4px !important;
            padding: 10px 22px !important;
            border: none !important;
            cursor: pointer;
            transition: background 0.2s;
        }
        .imprelapp-btn:hover {
            background: #034C8C !important;
        }
        .imprelapp-feedback {
            display: block;
            margin-top: 8px;
            font-size: 13px;
            font-family: 'Inter', sans-serif;
        }
        .imprelapp-feedback.success { color: #1a7a4a; }
        .imprelapp-feedback.error   { color: #c0392b; }
        @media (max-width: 600px) {
            .imprelapp-vendor-row { flex-direction: column; align-items: stretch; }
            .imprelapp-vendor-row #imprelapp_vendor_code { max-width: 100%; }
        }
        </style>
        <?php
    }
}

new Imprelapp_Vendor_Code();
