<template>
    <div id="app" class="wrap">
        <slot name="header"></slot>
        <main class="main">
            <slot></slot>
        </main>
        <slot name="footer"></slot>
        <slot name="overlay"></slot>
    </div>
</template>